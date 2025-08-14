import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  return (
    <div className={`markdown-content w-full overflow-x-auto ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义代码块样式
          code({ node, className, children, ...props }) {
            // @ts-expect-error: 'inline' is not in the type, but react-markdown provides it
            const inline = props.inline;
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="bg-gray-100 rounded-md p-3 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          // 自定义链接样式
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
                {...props}
              >
                {children}
              </a>
            )
          },
          // 自定义列表样式
          ul({ children, ...props }) {
            return (
              <ul className="list-disc list-inside space-y-1" {...props}>
                {children}
              </ul>
            )
          },
          ol({ children, ...props }) {
            return (
              <ol className="list-decimal list-inside space-y-1" {...props}>
                {children}
              </ol>
            )
          },
          // 自定义标题样式
          h1({ children, ...props }) {
            return (
              <h1 className="text-xl font-bold mt-4 mb-2" {...props}>
                {children}
              </h1>
            )
          },
          h2({ children, ...props }) {
            return (
              <h2 className="text-lg font-semibold mt-3 mb-2" {...props}>
                {children}
              </h2>
            )
          },
          h3({ children, ...props }) {
            return (
              <h3 className="text-base font-semibold mt-2 mb-1" {...props}>
                {children}
              </h3>
            )
          },
          // 自定义引用样式
          blockquote({ children, ...props }) {
            return (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600" {...props}>
                {children}
              </blockquote>
            )
          },
          // 自定义表格样式
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300" {...props}>
                  {children}
                </table>
              </div>
            )
          },
          th({ children, ...props }) {
            return (
              <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold" {...props}>
                {children}
              </th>
            )
          },
          td({ children, ...props }) {
            return (
              <td className="border border-gray-300 px-3 py-2" {...props}>
                {children}
              </td>
            )
          },
          // 自定义分割线样式
          hr({ ...props }) {
            return <hr className="border-gray-300 my-4" {...props} />
          },
          // 自定义段落样式
          p({ children, ...props }) {
            return (
              <p className="mb-2" {...props}>
                {children}
              </p>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 
