import { formatInt, formatPrice } from '../lib/format.js';

export default function ProductCatalog({ defaultRows, search, query }) {
  const searching = query.trim().length > 0;
  const { results, status } = search;
  const rows = searching ? (results?.rows ?? []).slice(0, 5) : defaultRows;

  let subtitle = 'Highest-priced products';
  if (searching) {
    if (status === 'loading') subtitle = 'Loading product index...';
    else if (status === 'error') subtitle = 'Could not load the product index';
    else if (results) subtitle = `${formatInt(results.total)} matches for "${query.trim()}"`;
  }

  return (
    <section className="card" id="products">
      <div className="card__head">
        <h2>Product Catalog</h2>
        <span className="card__sub" aria-live="polite">{subtitle}</span>
      </div>
      <div className="table-wrap">
        <table className="table table--compact">
          <thead>
            <tr>
              <th>Product</th>
              <th>Manufacturer</th>
              <th>Form</th>
              <th className="num">Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.name}-${i}`}>
                <td className="strong clip" title={`${r.name} — ${r.pack}`}>{r.name}</td>
                <td className="clip" title={r.manufacturer}>{r.manufacturer}</td>
                <td>{r.form}</td>
                <td className="num">{formatPrice(r.price)}</td>
                <td>
                  <span className={`badge ${r.discontinued ? 'badge--warn' : 'badge--ok'}`}>
                    {r.discontinued ? 'Discontinued' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
            {searching && status === 'ready' && rows.length === 0 && (
              <tr><td colSpan={5} className="empty">No products match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
