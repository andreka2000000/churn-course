import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export function TheoryView({ markdown }: { markdown: string }) {
  return (
    <article className="p-6 text-ui-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: (p) => <h1 className="text-2xl font-bold mt-6 mb-3 text-ui-heading" {...p} />,
          h2: (p) => <h2 className="text-xl font-bold mt-5 mb-2 text-ui-heading" {...p} />,
          h3: (p) => <h3 className="text-lg font-semibold mt-4 mb-2 text-ui-heading" {...p} />,
          p: (p) => <p className="my-3 leading-relaxed" {...p} />,
          code: ({ className, children, ...props }: any) => {
            const isInline = !className;
            return isInline ? <code className="px-1.5 py-0.5 rounded bg-bg-tertiary text-accent text-sm font-mono" {...props}>{children}</code> : <code className={className} {...props}>{children}</code>;
          },
          pre: (p) => <pre className="my-4 p-4 rounded-lg bg-bg-secondary border border-border overflow-auto text-sm" {...p} />,
          ul: (p) => <ul className="list-disc pl-6 my-3 space-y-1" {...p} />,
          ol: (p) => <ol className="list-decimal pl-6 my-3 space-y-1" {...p} />,
          li: (p) => <li className="leading-relaxed" {...p} />,
          blockquote: (p) => <blockquote className="border-l-4 border-accent pl-4 my-3 italic text-ui-text" {...p} />,
          a: (p) => <a className="text-accent hover:underline" target="_blank" rel="noopener noreferrer" {...p} />,
          table: (p) => <div className="overflow-auto my-4"><table className="border-collapse border border-border w-full" {...p} /></div>,
          th: (p) => <th className="border border-border px-3 py-2 bg-bg-tertiary text-left font-semibold text-ui-heading" {...p} />,
          td: (p) => <td className="border border-border px-3 py-2" {...p} />,
          hr: () => <hr className="my-6 border-border" />,
          strong: (p) => <strong className="font-semibold text-ui-heading" {...p} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}