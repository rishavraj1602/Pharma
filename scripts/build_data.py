"""Aggregate the pharmaceutical products CSV into JSON files for the dashboard.

Usage:
    python scripts/build_data.py <path-to-csv> [output-dir]

Writes:
    summary.json   - pre-computed aggregates for "all" and each therapeutic class
    products.json  - compact product index used by the search box (lazy-loaded)
"""

import csv
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

PRICE_BANDS = [
    (0, 25, "<₹25"),
    (25, 50, "₹25-50"),
    (50, 100, "₹50-100"),
    (100, 200, "₹100-200"),
    (200, 500, "₹200-500"),
    (500, 1000, "₹500-1K"),
    (1000, 5000, "₹1K-5K"),
    (5000, float("inf"), "₹5K+"),
]


def band_index(price):
    for i, (low, high, _) in enumerate(PRICE_BANDS):
        if low <= price < high:
            return i
    return len(PRICE_BANDS) - 1


class Bucket:
    """Running aggregates for one filter scope (all products or one class)."""

    def __init__(self):
        self.products = 0
        self.active = 0
        self.value = 0.0
        self.prices = []
        self.single_bands = [0] * len(PRICE_BANDS)
        self.combo_bands = [0] * len(PRICE_BANDS)
        self.forms = Counter()
        self.ingredients = Counter()
        self.mfr_count = Counter()
        self.mfr_value = Counter()
        self.mfr_class = defaultdict(Counter)
        self.mfr_bands = defaultdict(lambda: [0] * len(PRICE_BANDS))
        self.top_priced = []  # kept small: (price, row tuple)

    def add(self, row):
        price = row["price"]
        self.products += 1
        self.active += 0 if row["discontinued"] else 1
        self.value += price
        self.prices.append(price)
        b = band_index(price)
        if row["ingredients"] > 1:
            self.combo_bands[b] += 1
        else:
            self.single_bands[b] += 1
        self.forms[row["form"]] += 1
        if row["ingredient"]:
            self.ingredients[row["ingredient"]] += 1
        m = row["manufacturer"]
        self.mfr_count[m] += 1
        self.mfr_value[m] += price
        self.mfr_class[m][row["class"]] += 1
        self.mfr_bands[m][b] += 1
        self.top_priced.append((price, row))
        if len(self.top_priced) > 200:
            self.top_priced.sort(key=lambda t: -t[0])
            del self.top_priced[50:]

    def to_json(self):
        self.prices.sort()
        n = len(self.prices)
        median = self.prices[n // 2] if n else 0
        self.top_priced.sort(key=lambda t: -t[0])

        forms = self.forms.most_common()
        form_mix = [{"name": k.title(), "value": v} for k, v in forms[:4]]
        rest = sum(v for _, v in forms[4:])
        if rest:
            form_mix.append({"name": "Others", "value": rest})

        top_mfrs = []
        for name, count in self.mfr_count.most_common(5):
            classes = self.mfr_class[name].most_common()
            named = [c for c in classes if c[0] != "other"]
            top_class = (named[0][0] if named else classes[0][0]).title()
            top_mfrs.append({
                "name": name,
                "topClass": "Unclassified" if top_class == "Other" else top_class,
                "products": count,
                "value": round(self.mfr_value[name], 2),
                "bands": self.mfr_bands[name],
            })

        return {
            "kpis": {
                "products": self.products,
                "active": self.active,
                "discontinued": self.products - self.active,
                "manufacturers": len(self.mfr_count),
                "value": round(self.value, 2),
                "avgPrice": round(self.value / n, 2) if n else 0,
                "medianPrice": median,
            },
            "priceBands": [
                {"band": label, "single": s, "combo": c}
                for (_, _, label), s, c in zip(PRICE_BANDS, self.single_bands, self.combo_bands)
            ],
            "dosageForms": form_mix,
            "topManufacturers": top_mfrs,
            "topIngredients": [
                {"name": k, "value": v} for k, v in self.ingredients.most_common(6)
            ],
            "topPriced": [
                {
                    "name": r["name"],
                    "manufacturer": r["manufacturer"],
                    "form": r["form"].title(),
                    "pack": r["pack"],
                    "price": p,
                    "discontinued": r["discontinued"],
                }
                for p, r in self.top_priced[:5]
            ],
        }


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    csv_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent / "public" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    buckets = defaultdict(Bucket)
    class_counts = Counter()

    # Compact search index: parallel arrays with lookup tables for repeated strings.
    lookups = {"manufacturer": {}, "form": {}, "class": {}, "pack": {}}
    index = {"n": [], "m": [], "p": [], "f": [], "c": [], "k": [], "d": []}

    def lookup(kind, value):
        table = lookups[kind]
        if value not in table:
            table[value] = len(table)
        return table[value]

    with csv_path.open(encoding="utf-8", newline="") as fh:
        for raw in csv.DictReader(fh):
            try:
                price = float(raw["price_inr"])
            except (TypeError, ValueError):
                continue
            try:
                ingredients = int(raw["num_active_ingredients"] or 1)
            except ValueError:
                ingredients = 1
            row = {
                "name": raw["brand_name"].strip(),
                "manufacturer": raw["manufacturer"].strip(),
                "price": price,
                "discontinued": raw["is_discontinued"].strip().lower() == "true",
                "form": (raw["dosage_form"] or "other").strip().lower(),
                "class": (raw["therapeutic_class"] or "other").strip().lower(),
                "ingredient": raw["primary_ingredient"].strip(),
                "ingredients": ingredients,
                "pack": raw["packaging_raw"].strip(),
            }
            class_counts[row["class"]] += 1
            buckets["all"].add(row)
            buckets[row["class"]].add(row)

            index["n"].append(row["name"])
            index["m"].append(lookup("manufacturer", row["manufacturer"]))
            index["p"].append(price)
            index["f"].append(lookup("form", row["form"].title()))
            index["c"].append(lookup("class", row["class"]))
            index["k"].append(lookup("pack", row["pack"]))
            index["d"].append(1 if row["discontinued"] else 0)

    named = [(k, v) for k, v in class_counts.most_common() if k != "other"]
    class_mix = [{"key": k, "name": k.title(), "value": v} for k, v in named[:4]]
    class_mix.append({
        "key": "rest",
        "name": "Other Classes",
        "value": sum(v for _, v in named[4:]),
    })
    if class_counts.get("other"):
        class_mix.append({"key": "other", "name": "Unclassified", "value": class_counts["other"]})

    summary = {
        "source": csv_path.name,
        "classes": [{"key": k, "name": "Unclassified" if k == "other" else k.title(), "count": v}
                    for k, v in class_counts.most_common()],
        "classMix": class_mix,
        "scopes": {key: bucket.to_json() for key, bucket in buckets.items()},
    }
    for kind, table in lookups.items():
        index[kind] = list(table.keys())

    (out_dir / "summary.json").write_text(json.dumps(summary, ensure_ascii=False), encoding="utf-8")
    (out_dir / "products.json").write_text(
        json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    print(f"Wrote {out_dir / 'summary.json'} and {out_dir / 'products.json'} "
          f"({buckets['all'].products:,} products)")


if __name__ == "__main__":
    main()
