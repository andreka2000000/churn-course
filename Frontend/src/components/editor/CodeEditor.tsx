import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useRef } from "react";
import { useEditorStore } from "../../store/editorStore";
import { EditorToolbar } from "./EditorToolbar";
import { OutputPanel } from "./OutputPanel";
import { useRunner } from "../../hooks/useRunner";
import type { Lesson } from "../../types";

interface Props {
  lesson: Lesson;
}

export function CodeEditor({ lesson }: Props) {
  const { getCode, setCode, resetCode } = useEditorStore();
  const code = getCode(lesson.id, lesson.starter_code);
  const { run, submit, lastRun, lastSubmit, isRunning } = useRunner(lesson.id);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      submit(editor.getValue());
    });
  };

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar
        onRun={() => run(code)}
        onSubmit={() => submit(code)}
        onReset={() => resetCode(lesson.id)}
        isRunning={isRunning}
      />

      <div className="flex-1 grid grid-cols-2 min-h-0">
        <div className="border-r border-border min-h-0">
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={(v) => setCode(lesson.id, v ?? "")}
            onMount={handleMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "JetBrains Mono, Menlo, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: "on",
              padding: { top: 12 },
              renderLineHighlight: "all",
            }}
          />
        </div>

        <OutputPanel
          result={lastRun}
          submitResult={lastSubmit}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
}