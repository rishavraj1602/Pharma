import {
  Boxes, Database, Factory, FlaskConical, Home, LineChart, Package, PieChart, Pill,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: Home },
  { id: 'pricing', label: 'Pricing', icon: LineChart },
  { id: 'categories', label: 'Categories', icon: PieChart },
  { id: 'manufacturers', label: 'Manufacturers', icon: Factory },
  { id: 'dosage-forms', label: 'Dosage Forms', icon: Pill },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'ingredients', label: 'Ingredients', icon: FlaskConical },
];

export default function Sidebar({ active, onNavigate, open, source }) {
  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
      <div className="brand">
        <div className="brand__logo"><Boxes size={22} /></div>
        <div>
          <div className="brand__name">PharmaScope</div>
          <div className="brand__tag">Pharma Catalog</div>
        </div>
      </div>
      <nav className="nav" aria-label="Dashboard sections">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav__item${active === id ? ' nav__item--active' : ''}`}
            aria-current={active === id ? 'true' : undefined}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar__footer">
        <Database size={16} />
        <div>
          <div className="sidebar__footer-label">Data source</div>
          <div className="sidebar__footer-value" title={source}>{source}</div>
        </div>
      </div>
    </aside>
  );
}
