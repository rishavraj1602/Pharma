import { formatInt, formatPercent } from '../lib/format.js';

export default function TopIngredients({ rows, total }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <section className="card" id="ingredients">
      <div className="card__head">
        <h2>Top Active Ingredients</h2>
        <span className="card__sub">Share of products</span>
      </div>
      <ul className="bars">
        {rows.map((r, i) => (
          <li key={r.name} className="bars__row">
            <span className="bars__name">{r.name}</span>
            <span className="bars__track" title={`${formatInt(r.value)} products`}>
              <span
                className="bars__fill"
                style={{ width: `${(r.value / max) * 100}%`, opacity: 1 - i * 0.1 }}
              />
            </span>
            <span className="bars__count">{formatInt(r.value)}</span>
            <span className="bars__pct">{formatPercent(r.value, total)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
