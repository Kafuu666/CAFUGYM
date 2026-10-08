// variant: 'primary' (default) | 'ghost' | 'danger' | 'ghost-danger'
export default function Button({ variant = 'primary', small = false, className = '', type = 'button', ...props }) {
  const cls = {
    primary: `btn${small ? ' sm' : ''}`,
    danger: `btn${small ? ' sm' : ''} danger`,
    ghost: 'ghost',
    'ghost-danger': 'ghost bd',
  }[variant];
  return <button type={type} className={`${cls} ${className}`.trim()} {...props} />;
}
