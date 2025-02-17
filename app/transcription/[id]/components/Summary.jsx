import ReactMarkdown from "react-markdown";

const markdownStyles = {
  container: {
    fontSize: "14px",
  },
  header: {
    color: "#666",
  },
  content: {
    borderTop: "1px solid #eee",
    paddingTop: "0.5rem",
    whiteSpace: "pre-wrap",
  },
  markdown: {
    h1: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "1rem",
      marginTop: "1rem",
    },
    h2: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      marginBottom: "0.75rem",
      marginTop: "0.75rem",
    },
    h3: {
      fontSize: "1.1rem",
      fontWeight: "bold",
      marginBottom: "1rem",
      marginTop: "1rem",
      display: "block",
    },
    p: {
      marginBottom: "1rem",
      display: "block",
      whiteSpace: "pre-line",
    },
    ul: {
      listStyleType: "disc",
      paddingLeft: "1.5rem",
      marginBottom: "1rem",
    },
    ol: {
      listStyleType: "decimal",
      paddingLeft: "1.5rem",
      marginBottom: "1rem",
    },
    li: {
      marginBottom: "0.5rem",
    },
    strong: {
      fontWeight: "bold",
      display: "inline-block",
    },
    em: {
      fontStyle: "italic",
    },
    code: {
      backgroundColor: "#f0f0f0",
      padding: "0.2rem 0.4rem",
      borderRadius: "0.25rem",
      fontSize: "0.9em",
    },
    blockquote: {
      borderLeft: "4px solid #e2e8f0",
      paddingLeft: "1rem",
      marginLeft: "0",
      marginBottom: "1rem",
      fontStyle: "italic",
    },
  },
};

const MarkdownComponents = {
  h1: ({ children }) => <h1 style={markdownStyles.markdown.h1}>{children}</h1>,
  h2: ({ children }) => <h2 style={markdownStyles.markdown.h2}>{children}</h2>,
  h3: ({ children }) => <h3 style={markdownStyles.markdown.h3}>{children}</h3>,
  p: ({ children }) => <p style={markdownStyles.markdown.p}>{children}</p>,
  ul: ({ children }) => <ul style={markdownStyles.markdown.ul}>{children}</ul>,
  ol: ({ children }) => <ol style={markdownStyles.markdown.ol}>{children}</ol>,
  li: ({ children }) => <li style={markdownStyles.markdown.li}>{children}</li>,
  strong: ({ children }) => (
    <strong style={markdownStyles.markdown.strong}>{children}</strong>
  ),
  em: ({ children }) => <em style={markdownStyles.markdown.em}>{children}</em>,
  code: ({ children }) => (
    <code style={markdownStyles.markdown.code}>{children}</code>
  ),
  blockquote: ({ children }) => (
    <blockquote style={markdownStyles.markdown.blockquote}>
      {children}
    </blockquote>
  ),
};

export default function Summary({ summary }) {
  if (!summary) {
    return <div style={{ color: "#666" }}>Краткое содержание недоступно</div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Преобразуем текст, чтобы каждый элемент задачи начинался с новой строки
  const formatSummaryText = (text) => {
    return text
      .replace(/\*\*([^:]+):\*\*/g, "\n**$1:**") // Добавляем перенос строки перед каждым новым элементом
      .trim(); // Убираем лишние пробелы в начале и конце
  };

  return (
    <div style={markdownStyles.container}>
      <div style={markdownStyles.header}>
        {/*     
        {summary.timestamp && (
          <div>
            <strong>Создано:</strong> {formatDate(summary.timestamp)}
          </div>
        )} */}
      </div>
      <div style={markdownStyles.content}>
        <ReactMarkdown components={MarkdownComponents}>
          {formatSummaryText(
            typeof summary === "string" ? summary : summary.text
          )}
        </ReactMarkdown>
      </div>
    </div>
  );
}
