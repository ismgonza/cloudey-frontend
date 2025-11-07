import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownMessage({ content, isUser }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Customize table styling
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-3 rounded-lg border border-gray-300">
            <table className="min-w-full divide-y divide-gray-300" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-4 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody className="bg-white divide-y divide-gray-200" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="hover:bg-gray-50 transition-colors" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-2.5 text-sm text-gray-700 whitespace-nowrap" {...props} />
        ),
        // Code blocks
        code: ({ node, inline, ...props }) => (
          inline 
            ? <code className="px-1 py-0.5 rounded bg-gray-200 text-gray-800 text-xs font-mono" {...props} />
            : <code className="block p-3 rounded bg-gray-800 text-gray-100 text-xs font-mono overflow-x-auto" {...props} />
        ),
        // Links
        a: ({ node, ...props }) => (
          <a className="text-primary-600 hover:text-primary-700 underline" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        // Paragraphs
        p: ({ node, ...props }) => (
          <p className="mb-2 last:mb-0" {...props} />
        ),
        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-outside ml-5 mb-2 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-outside ml-5 mb-2 space-y-1" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="pl-1" {...props} />
        ),
        // Headings
        h1: ({ node, ...props }) => (
          <h1 className="text-lg font-bold mt-4 mb-2" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-base font-bold mt-3 mb-2" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-sm font-bold mt-2 mb-1" {...props} />
        ),
        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
        ),
        // Strong/Bold
        strong: ({ node, ...props }) => (
          <strong className="font-semibold" {...props} />
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

