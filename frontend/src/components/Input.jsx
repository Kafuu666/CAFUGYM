// as: 'input' (default) | 'select' | 'textarea'
export default function Input({ label, as: Tag = 'input', hint, children, ...props }) {
  return (
    <label>
      {label}
      <Tag {...props}>{children}</Tag>
      {hint && <small>{hint}</small>}
    </label>
  );
}
