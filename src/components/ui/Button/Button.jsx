const variantClassNames = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  dark: "btn-dark",
  ghost: "btn-ghost",
  outline: "btn-outline",
  telegram: "btn-telegram",
  whatsapp: "btn-whatsapp",
};

export default function Button({
  as: Component = "a",
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const variantClassName = variantClassNames[variant] || variantClassNames.primary;

  return (
    <Component className={`btn ${variantClassName} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
