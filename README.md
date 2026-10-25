# PharmaScope Dashboard

React + Vite dashboard built from `indian_pharmaceutical_products_clean.csv` (inside `archive.zip`), styled after the SCM Pro mockup.

## Setup

```bash
npm install
# Unzip archive.zip, then build the dashboard data from the CSV:
npm run data -- "<path>/indian_pharmaceutical_products_clean.csv"
npm run dev
```

`npm run data` writes `public/data/summary.json` (pre-computed aggregates, ~32 KB) and
`public/data/products.json` (search index, ~11 MB, only loaded when you search).

## What each panel shows

| Mockup panel | This dashboard | Source columns |
| --- | --- | --- |
| KPI cards | Total products, manufacturers, catalog value (sum of MRP), % active | `price_inr`, `manufacturer`, `is_discontinued` |
| Sales Trend | Price distribution, single-ingredient vs combination | `price_inr`, `num_active_ingredients` |
| Sales by Product Category | Products by therapeutic class (click a slice to filter) | `therapeutic_class` |
| Top Products | Top manufacturers by product count, with price mix sparkline | `manufacturer`, `price_inr` |
| Orders by Status | Products by dosage form | `dosage_form` |
| Inventory Levels | Product catalog: highest-priced products, or search results | `brand_name`, `packaging_raw`, `is_discontinued` |
| Region-wise Sales | Top active ingredients | `primary_ingredient` |

The dataset has no dates, orders, regions or stock levels, so those mockup panels show the closest real fields instead.
The class filter in the top bar recalculates every panel except the class donut, which highlights the selected class.
