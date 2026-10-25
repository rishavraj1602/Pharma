import { useEffect, useMemo, useState } from 'react';

const MAX_RESULTS = 8;
let indexPromise = null;

// The full product index is large, so it is fetched once, on first search.
function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch('/data/products.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load product index (${res.status})`);
        return res.json();
      })
      .then((raw) => ({
        ...raw,
        lowerNames: raw.n.map((name) => name.toLowerCase()),
        lowerManufacturers: raw.manufacturer.map((name) => name.toLowerCase()),
      }))
      .catch((err) => {
        indexPromise = null;
        throw err;
      });
  }
  return indexPromise;
}

export function useProductSearch(query, classKey) {
  const [index, setIndex] = useState(null);
  const [status, setStatus] = useState('idle');
  const term = query.trim().toLowerCase();

  useEffect(() => {
    if (!term || index) return;
    let cancelled = false;
    setStatus('loading');
    loadIndex()
      .then((data) => {
        if (!cancelled) {
          setIndex(data);
          setStatus('ready');
        }
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [term, index]);

  const results = useMemo(() => {
    if (!term || !index) return null;
    const classId = classKey === 'all' ? -1 : index.class.indexOf(classKey);
    // Rank: name starts with term, a word in the name starts with it,
    // name contains it anywhere, then manufacturer name matches.
    const tiers = [[], [], [], []];
    const wordStart = ` ${term}`;
    let total = 0;
    for (let i = 0; i < index.n.length; i += 1) {
      if (classId !== -1 && index.c[i] !== classId) continue;
      const name = index.lowerNames[i];
      let tier;
      if (name.startsWith(term)) tier = 0;
      else if (name.includes(wordStart)) tier = 1;
      else if (name.includes(term)) tier = 2;
      else if (index.lowerManufacturers[index.m[i]].includes(term)) tier = 3;
      else continue;
      total += 1;
      if (tiers[tier].length < MAX_RESULTS) tiers[tier].push(i);
    }
    const rows = tiers.flat().slice(0, MAX_RESULTS).map((i) => ({
      name: index.n[i],
      manufacturer: index.manufacturer[index.m[i]],
      form: index.form[index.f[i]],
      pack: index.pack[index.k[i]],
      price: index.p[i],
      discontinued: index.d[i] === 1,
    }));
    return { rows, total };
  }, [term, index, classKey]);

  return { results, status: term ? status : 'idle' };
}
