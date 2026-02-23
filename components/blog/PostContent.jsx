export default function PostContent({ html }) {
  return (
    // <div className="prose prose-lg dark:prose-invert max-w-none">
    <div className="prose prose-lg max-w-none">
      <div
        className="leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}