import Sparkline from './Sparkline.jsx';
import { formatCompactINR, formatInt } from '../lib/format.js';

export default function TopManufacturers({ rows }) {
  return (
    <section className="card" id="manufacturers">
      <div className="card__head"><h2>Top Manufacturers</h2></div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Manufacturer</th>
              <th>Top Class</th>
              <th className="num">Products</th>
              <th className="num">Catalog Value</th>
              <th title="Product count across price bands, low to high">Price Mix</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.name}>
                <td>{i + 1}</td>
                <td className="strong clip" title={r.name}>{r.name}</td>
                <td>{r.topClass}</td>
                <td className="num">{formatInt(r.products)}</td>
                <td className="num">{formatCompactINR(r.value)}</td>
                <td><Sparkline values={r.bands} label={`Price mix for ${r.name}`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
