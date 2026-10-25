import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Factory, IndianRupee, Package } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import KpiCard from './components/KpiCard.jsx';
import PriceDistribution from './components/PriceDistribution.jsx';
import DonutCard from './components/DonutCard.jsx';
import TopManufacturers from './components/TopManufacturers.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';
import TopIngredients from './components/TopIngredients.jsx';
import { useProductSearch } from './hooks/useProductSearch.js';
import {
  formatCompactINR, formatInt, formatPercent, formatPrice,
} from './lib/format.js';

const CLASS_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#f97316', '#8b5cf6', '#cbd5e1'];
const FORM_COLORS = ['#16a34a', '#38bdf8', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function App() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [classKey, setClassKey] = useState('all');
  const [query, setQuery] = useState('');
  const [activeNav, setActiveNav] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const search = useProductSearch(query, classKey);

  useEffect(() => {
    fetch('/data/summary.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  const classMix = useMemo(() => {
    if (!summary) return [];
    return summary.classMix.map((c) => ({ ...c, selectable: c.key !== 'rest' }));
  }, [summary]);

  if (error) {
    return <div className="state">Could not load dashboard data ({error}). Run <code>npm run data -- &lt;csv&gt;</code> first.</div>;
  }
  if (!summary) return <div className="state">Loading dashboard...</div>;

  const scope = summary.scopes[classKey] ?? summary.scopes.all;
  const { kpis } = scope;
  const topMfr = scope.topManufacturers[0];

  let highlight = null;
  if (classKey !== 'all') {
    highlight = classMix.some((c) => c.key === classKey) ? classKey : 'rest';
  }

  const navigate = (id) => {
    setActiveNav(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="layout">
      <Sidebar active={activeNav} onNavigate={navigate} open={menuOpen} source={summary.source} />
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <div className="main">
        <Topbar
          query={query}
          onQuery={setQuery}
          search={search}
          onViewResults={() => navigate('products')}
          classKey={classKey}
          onClass={setClassKey}
          classes={summary.classes}
          total={kpis.products}
          onMenu={() => setMenuOpen(true)}
        />
        <main className="content">
          <div className="kpis" id="overview">
            <KpiCard
              icon={Package}
              tone="blue"
              label="Total Products"
              value={formatInt(kpis.products)}
              note={`${formatInt(kpis.discontinued)} discontinued`}
              noteTone="muted"
            />
            <KpiCard
              icon={Factory}
              tone="green"
              label="Manufacturers"
              value={formatInt(kpis.manufacturers)}
              note={topMfr ? `Top: ${topMfr.name}` : ''}
              noteTone="muted"
            />
            <KpiCard
              icon={IndianRupee}
              tone="purple"
              label="Catalog Value (MRP)"
              value={formatCompactINR(kpis.value)}
              note={`Avg ${formatPrice(kpis.avgPrice)} · Median ${formatPrice(kpis.medianPrice)}`}
              noteTone="muted"
            />
            <KpiCard
              icon={CheckCircle2}
              tone="teal"
              label="Active Products"
              value={formatPercent(kpis.active, kpis.products)}
              note={`${formatInt(kpis.active)} available`}
            />
          </div>

          <div className="row row--a">
            <PriceDistribution data={scope.priceBands} />
            <DonutCard
              id="categories"
              title="Products by Therapeutic Class"
              data={classMix}
              colors={CLASS_COLORS}
              centerValue={formatInt(summary.scopes.all.kpis.products)}
              centerLabel="All Products"
              highlight={highlight}
              onSelect={(d) => d.selectable && setClassKey((k) => (k === d.key ? 'all' : d.key))}
            />
          </div>

          <div className="row row--b">
            <TopManufacturers rows={scope.topManufacturers} />
            <DonutCard
              id="dosage-forms"
              title="Products by Dosage Form"
              data={scope.dosageForms}
              colors={FORM_COLORS}
              centerValue={formatInt(kpis.products)}
              centerLabel="Total Products"
            />
          </div>

          <div className="row row--c">
            <ProductCatalog defaultRows={scope.topPriced} search={search} query={query} />
            <TopIngredients rows={scope.topIngredients} total={kpis.products} />
          </div>
        </main>
      </div>
    </div>
  );
}
