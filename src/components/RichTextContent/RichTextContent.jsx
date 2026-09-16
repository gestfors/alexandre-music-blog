import { sanitizeRichText } from "../../utils/richText.js";

export default function RichTextContent({ children, className = "" }) {
  return (
    <div
      className={`rich-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(children || "") }}
    />
  );
}
