import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleSubmit(editor.getValue());
    });
  };

  const handleSubmit = (codeToSubmit: string) => {
    submit(codeToSubmit, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["course", 1] });
        queryClient.invalidateQueries({ queryKey: ["progress"] });
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar
        onRun={() => run(code)}
        onSubmit={() => handleSubmit(code)}
        onReset={() => resetCode(lesson.id)}
        isRunning={isRunning}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] min-h-0">
        {/* Контейнер для Monaco с жесткой высотой и скрытием переполнения */}
        <div className="border-b lg:border-b-0 lg:border-r border-border h-[500px] lg:h-auto lg:min-h-0 overflow-hidden">
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
              
              // Включаем прокрутку
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: true,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
              wordWrap: "off", // Отключаем перенос строк, чтобы работала горизонтальная прокрутка
              
              padding: { top: 12 },
              renderLineHighlight: "all",
            }}
          />
        </div>

        <div className="h-[500px] lg:h-auto lg:min-h-0 overflow-hidden">
          <OutputPanel
            result={lastRun}
            submitResult={lastSubmit}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
}