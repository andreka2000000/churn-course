package runner

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// ExecRequest — запрос к PyRunner
type ExecRequest struct {
	Code     string `json:"code"`
	TestCode string `json:"test_code,omitempty"`
	Timeout  int    `json:"timeout,omitempty"`
}

// TestResult — результат одного теста
type TestResult struct {
	Name    string `json:"name"`
	Passed  bool   `json:"passed"`
	Message string `json:"message,omitempty"`
}

// ExecResponse — ответ от PyRunner
type ExecResponse struct {
	Stdout     string            `json:"stdout"`
	Stderr     string            `json:"stderr"`
	ExitCode   int               `json:"exit_code"`
	DurationMs int               `json:"duration_ms"`
	Files      map[string]string `json:"files"`
	Tests      []TestResult      `json:"tests"`
	Passed     bool              `json:"passed"`
}

var httpClient = &http.Client{Timeout: 60 * time.Second}

// Execute — отправляет код в PyRunner и возвращает результат
func Execute(req ExecRequest) (*ExecResponse, error) {
	runnerURL := os.Getenv("RUNNER_URL")
	if runnerURL == "" {
		runnerURL = "http://localhost:9000"
	}

	body, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal: %w", err)
	}

	resp, err := httpClient.Post(runnerURL+"/execute", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("runner request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("runner returned %d: %s", resp.StatusCode, string(b))
	}

	var result ExecResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode: %w", err)
	}

	return &result, nil
}