import { STATUS } from '../utils/format';

export default function Tag({ status }) {
  const [label, tone] = STATUS[status] || [status, 'mu'];
  return <span className={`tag ${tone}`}>{label}</span>;
}
