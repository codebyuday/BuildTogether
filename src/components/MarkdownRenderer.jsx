import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownRenderer({ children, className = '' }) {
  if (!children) return null
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      className={`prose prose-invert prose-sm max-w-none ${className}`}
      components={{
        h1: ({ children }) => <h1 className="text-[20px] font-bold text-ink mb-2 mt-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-[16px] font-semibold text-ink mb-2 mt-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-[14px] font-semibold text-ink mb-1 mt-2">{children}</h3>,
        p: ({ children }) => <p className="text-[14px] text-secondary mb-2 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 text-[14px] text-secondary">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 text-[14px] text-secondary">{children}</ol>,
        li: ({ children }) => <li className="mb-0.5">{children}</li>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>,
        code: ({ inline, className, children }) => {
          if (inline) return <code className="bg-surface-container-high px-1 py-0.5 rounded text-[13px] font-mono text-primary">{children}</code>
          return <code className={`block bg-surface-container-lowest p-3 rounded-lg text-[13px] font-mono text-ink overflow-x-auto ${className || ''}`}>{children}</code>
        },
        pre: ({ children }) => <pre className="mb-2">{children}</pre>,
        blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/40 pl-3 text-[14px] text-secondary italic">{children}</blockquote>,
        table: ({ children }) => <table className="w-full text-[13px] text-ink border-collapse mb-2">{children}</table>,
        th: ({ children }) => <th className="text-left p-2 border-b border-outline-variant/30 text-secondary font-medium">{children}</th>,
        td: ({ children }) => <td className="p-2 border-b border-outline-variant/20">{children}</td>,
        hr: () => <hr className="border-outline-variant/30 my-4" />,
        strong: ({ children }) => <strong className="text-ink font-semibold">{children}</strong>,
        em: ({ children }) => <em className="text-secondary">{children}</em>,
      }}
    >
      {children}
    </Markdown>
  )
}
