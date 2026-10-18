import base64
import os
import time
import uuid
from pathlib import Path
from typing import Optional

import docker
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

load_dotenv()

SANDBOX_IMAGE = os.getenv("SANDBOX_IMAGE", "churn-sandbox:latest")
DATA_DIR = Path(os.getenv("DATA_DIR", "./data")).resolve()
WORKSPACES_DIR = Path(os.getenv("WORKSPACES_DIR", "./workspaces")).resolve()
HOST_DATA_DIR = os.getenv("HOST_DATA_DIR", str(DATA_DIR))
HOST_WORKSPACES_DIR = os.getenv("HOST_WORKSPACES_DIR", str(WORKSPACES_DIR))
DEFAULT_TIMEOUT = int(os.getenv("DEFAULT_TIMEOUT", "30"))
DEFAULT_MEMORY_MB = int(os.getenv("DEFAULT_MEMORY_MB", "512"))

app = FastAPI(title="PyRunner", version="1.0.0")
client = docker.from_env()


# ============ Схемы ============

class ExecRequest(BaseModel):
    code: str
    test_code: Optional[str] = None
    timeout: int = DEFAULT_TIMEOUT


class TestResult(BaseModel):
    name: str
    passed: bool
    message: Optional[str] = None


class ExecResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    duration_ms: int
    files: dict[str, str] = {}
    tests: list[TestResult] = []
    passed: bool = False


# ============ Healthcheck ============

@app.get("/ping")
def ping():
    return {"status": "ok", "sandbox_image": SANDBOX_IMAGE}


# ============ Основная логика ============

@app.post("/execute", response_model=ExecResponse)
def execute(req: ExecRequest):
    run_id = str(uuid.uuid4())[:8]
    workdir = WORKSPACES_DIR / run_id
    workdir.mkdir(parents=True, exist_ok=True)

    # 1. Кладём код студента
    (workdir / "solution.py").write_text(req.code, encoding="utf-8")

    # 2. Определяем команду
    if req.test_code:
        (workdir / "test_solution.py").write_text(req.test_code, encoding="utf-8")
        command = [
            "python", "-m", "pytest",
            "/workspace/test_solution.py",
            "-v", "--tb=short", "--no-header",
            "-p", "no:cacheprovider",
        ]
    else:
        command = ["python", "/workspace/solution.py"]

    # 3. Запускаем контейнер
    start = time.time()
    container = None
    try:
        container = client.containers.run(
            SANDBOX_IMAGE,
            command=command,
            mem_limit=f"{DEFAULT_MEMORY_MB}m",
            nano_cpus=1_000_000_000,
            network_disabled=True,
            read_only=True,
            tmpfs={"/tmp": "size=128m"},
            working_dir="/workspace",
            volumes={
                f"{HOST_WORKSPACES_DIR}\\{run_id}": {"bind": "/workspace", "mode": "rw"},
                HOST_DATA_DIR: {"bind": "/data", "mode": "ro"},
            },
            environment={"MPLBACKEND": "Agg"},
            detach=True,
        )

        try:
            result = container.wait(timeout=req.timeout)
            exit_code = result["StatusCode"]
        except Exception:
            container.kill()
            exit_code = 124
        finally:
            duration_ms = int((time.time() - start) * 1000)

        stdout = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
        stderr = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace")

    except docker.errors.ImageNotFound:
        raise HTTPException(500, f"Образ песочницы не найден: {SANDBOX_IMAGE}")
    except docker.errors.APIError as e:
        raise HTTPException(500, f"Docker API error: {e}")
    finally:
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass

    # 4. Забираем сгенерированные файлы
    files: dict[str, str] = {}
    for f in workdir.iterdir():
        if f.name in ("solution.py", "test_solution.py"):
            continue
        if f.suffix.lower() in (".png", ".jpg", ".jpeg"):
            files[f.name] = base64.b64encode(f.read_bytes()).decode("ascii")

    # 5. Парсим pytest
    tests: list[TestResult] = []
    passed = False
    if req.test_code:
        tests = parse_pytest_output(stdout)
        passed = exit_code == 0 and len(tests) > 0 and all(t.passed for t in tests)

    return ExecResponse(
        stdout=stdout,
        stderr=stderr,
        exit_code=exit_code,
        duration_ms=duration_ms,
        files=files,
        tests=tests,
        passed=passed,
    )


def parse_pytest_output(output: str) -> list[TestResult]:
    results: list[TestResult] = []
    for line in output.splitlines():
        if "::" not in line:
            continue
        for status in ("PASSED", "FAILED", "ERROR"):
            if f" {status}" in line:
                parts = line.split("::")
                if len(parts) < 2:
                    continue
                name = parts[1].split(" ")[0].strip()
                results.append(
                    TestResult(
                        name=name,
                        passed=(status == "PASSED"),
                        message=None if status == "PASSED" else status,
                    )
                )
                break
    return results