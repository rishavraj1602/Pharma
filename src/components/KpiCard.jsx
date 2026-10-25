export default function KpiCard({ icon: Icon, tone, label, value, note, noteTone = 'up' }) {
  return (
    <div className="card kpi">
      <div className={`kpi__icon kpi__icon--${tone}`}><Icon size={24} /></div>
      <div className="kpi__body">
        <div className="kpi__label">{label}</div>
        <div className="kpi__value">{value}</div>
        <div className={`kpi__note kpi__note--${noteTone}`} title={note}>{note}</div>
      </div>
    </div>
  );
}
