export default function Card({ as: Component = "article", children, className = "", ...props }) {
  return (
    <Component className={`card ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
