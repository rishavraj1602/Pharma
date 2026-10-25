# PharmaScope Dashboard

A React and Vite dashboard for exploring a large Indian pharmaceutical medicines dataset sourced from Kaggle. It presents product, manufacturer, pricing, dosage-form, therapeutic-class, and active-ingredient data in interactive charts and KPI cards. You can filter the dashboard by therapeutic class and search the product catalog.

**Live dashboard:** [pharma-dashboard1.netlify.app](https://pharma-dashboard1.netlify.app/)

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173/`) in your browser. The repository includes the generated dashboard data, so you can run the app without the original CSV.

To regenerate the dashboard data, provide the source CSV (`indian_pharmaceutical_products_clean.csv`, originally distributed inside `archive.zip`):

```bash
npm run data -- "<path>/indian_pharmaceutical_products_clean.csv"
```

This writes `public/data/summary.json` (pre-computed aggregates) and `public/data/products.json` (the product search index, loaded when you search).

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
