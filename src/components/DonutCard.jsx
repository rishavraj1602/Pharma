import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatInt, formatPercent } from '../lib/format.js';

export default function DonutCard({
  id, title, data, colors, centerValue, centerLabel, highlight, onSelect,
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const isDim = (d) => highlight && d.key !== highlight;

  return (
    <section className="card" id={id}>
      <div className="card__head"><h2>{title}</h2></div>
      <div className="donut">
        <div className="donut__chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="98%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
                onClick={onSelect ? (d) => onSelect(d.payload) : undefined}
              >
                {data.map((d, i) => (
                  <Cell
                    key={d.name}
                    fill={colors[i % colors.length]}
                    opacity={isDim(d) ? 0.25 : 1}
                    style={{ cursor: onSelect && d.selectable ? 'pointer' : 'default', outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${formatInt(v)} (${formatPercent(v, total)})`, 'Products']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut__center">
            <div className="donut__value">{centerValue}</div>
            <div className="donut__label">{centerLabel}</div>
          </div>
        </div>
        <ul className="legend">
          {data.map((d, i) => (
            <li key={d.name} className={isDim(d) ? 'legend__item--dim' : undefined}>
              <span className="dot" style={{ background: colors[i % colors.length] }} />
              <span className="legend__name">{d.name}</span>
              <span className="legend__value">{formatPercent(d.value, total)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
