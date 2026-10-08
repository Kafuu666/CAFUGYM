import { fmtDate } from '../utils/format';

// Kartu identitas member (proporsi kartu ATM/ID, 85,6 × 54 mm saat dicetak).
// Pembungkus ".print-area" dipakai CSS cetak agar hanya kartu yang tercetak.
export default function MemberCard({ card }) {
  const active = card.status === 'ACTIVE';
  return (
    <div className="print-area">
      <article className="idc" aria-label={`Kartu member ${card.name}`}>
        <div className="idc-top">
          <b>CAFU GYM</b>
          <span>FITNESS CENTER</span>
        </div>
        <div>
          <div className="idc-name">{card.name}</div>
          <div className="idc-code">{card.member_code}</div>
        </div>
        <div className="idc-row">
          <div><small>Paket</small><b>{card.package_name}</b></div>
          <div><small>Berlaku s.d.</small><b>{fmtDate(card.end_date)}</b></div>
          <span className={`idc-st${active ? '' : ' off'}`}>{active ? 'AKTIF' : 'BERAKHIR'}</span>
        </div>
      </article>
    </div>
  );
}
