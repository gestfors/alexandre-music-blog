export default function Section({
  as: Component = "section",
  children,
  className = "",
  containerClassName = "container",
  containerStyle,
  ...props
}) {
  return (
    <Component className={`section ${className}`.trim()} {...props}>
      <div className={containerClassName} style={containerStyle}>
        {children}
      </div>
    </Component>
  );
}
