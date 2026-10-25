import { useEffect, useRef, useState } from 'react';
import { Filter, Menu, Search, X } from 'lucide-react';
import { formatInt, formatPrice } from '../lib/format.js';

function SearchResults({ query, search, onViewAll }) {
  const { results, status } = search;
  if (status === 'loading' || (status !== 'error' && !results)) {
    return <div className="search-results__state">Loading product index...</div>;
  }
  if (status === 'error') {
    return <div className="search-results__state">Could not load the product index. Try again.</div>;
  }
  if (results.total === 0) {
    return <div className="search-results__state">No products or manufacturers match "{query.trim()}".</div>;
  }
  return (
    <>
      <ul className="search-results__list">
        {results.rows.map((r, i) => (
          <li key={`${r.name}-${i}`} className="search-results__item" title={r.pack}>
            <div className="search-results__main">
              <span className="search-results__name">{r.name}</span>
              <span className="search-results__meta">{r.manufacturer} · {r.form}</span>
            </div>
            <span className="search-results__price">{formatPrice(r.price)}</span>
            <span className={`badge ${r.discontinued ? 'badge--warn' : 'badge--ok'}`}>
              {r.discontinued ? 'Discontinued' : 'Active'}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className="search-results__footer" onClick={onViewAll}>
        Showing {results.rows.length} of {formatInt(results.total)} matches · View in Product Catalog
      </button>
    </>
  );
}

export default function Topbar({
  query, onQuery, search, onViewResults, classKey, onClass, classes, total, onMenu,
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const showResults = open && query.trim().length > 0;

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const viewAll = () => {
    setOpen(false);
    onViewResults();
  };

  return (
    <header className="topbar">
      <button type="button" className="icon-btn topbar__menu" onClick={onMenu} aria-label="Open navigation">
        <Menu size={20} />
      </button>
      <div className="search-box" ref={boxRef}>
        <label className="search">
          <Search size={17} />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              onQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
              if (e.key === 'Enter' && query.trim()) viewAll();
            }}
            placeholder="Search products or manufacturers..."
            aria-label="Search products or manufacturers"
            aria-expanded={showResults}
            aria-controls="search-results"
          />
          {query && (
            <button
              type="button"
              className="search__clear"
              onClick={() => {
                onQuery('');
                setOpen(false);
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </label>
        {showResults && (
          <div className="search-results" id="search-results" aria-live="polite">
            <SearchResults query={query} search={search} onViewAll={viewAll} />
          </div>
        )}
      </div>
      <div className="topbar__right">
        <label className="select">
          <Filter size={16} />
          <select value={classKey} onChange={(e) => onClass(e.target.value)} aria-label="Therapeutic class">
            <option value="all">All therapeutic classes</option>
            {classes.map((c) => (
              <option key={c.key} value={c.key}>{c.name} ({formatInt(c.count)})</option>
            ))}
          </select>
        </label>
        <div className="topbar__meta">{formatInt(total)} products</div>
      </div>
    </header>
  );
}
