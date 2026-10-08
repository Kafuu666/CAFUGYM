export default function Card({ as: Tag = 'section', className = '', ...props }) {
  return <Tag className={`card ${className}`.trim()} {...props} />;
}
