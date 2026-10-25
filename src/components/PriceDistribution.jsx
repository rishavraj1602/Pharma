import { useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { formatAxis, formatInt } from '../lib/format.js';

const SERIES = [
  { key: 'single', label: 'Single ingredient', color: '#3b82f6' },
  { key: 'combo', label: 'Combination', color: '#22c55e' },
];

export default function PriceDistribution({ data }) {
  const [visible, setVisible] = useState({ single: true, combo: true });
  const toggle = (key) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  return (
    <section className="card" id="pricing">
      <div className="card__head">
        <h2>Price Distribution</h2>
        <div className="toggles">
          {SERIES.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`toggle${visible[s.key] ? '' : ' toggle--off'}`}
              aria-pressed={visible[s.key]}
              onClick={() => toggle(s.key)}
            >
              <span className="dot" style={{ background: s.color }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <defs>
              {SERIES.map((s) => (
                <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="#eef1f6" vertical />
            <XAxis dataKey="band" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} interval={0} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={formatAxis} />
            <Tooltip formatter={(v, name) => [formatInt(v), name]} labelFormatter={(l) => `Price ${l}`} />
            {SERIES.map((s) => visible[s.key] && (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.2}
                fill={`url(#fill-${s.key})`}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
