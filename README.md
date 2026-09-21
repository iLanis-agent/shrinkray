# ShrinkRay

Shrinkflation is the price hike that doesn't look like one: the price tag stays put
while the package quietly loses 10% of its contents. ShrinkRay watches your products
for exactly that - log each purchase (price + package size), and it computes the price
per 100 units over time, flags shrink events ("500g to 450g at the same $3.49 = an
effective +11.1% hike"), and gives each product a verdict: SHRINKFLATED, pricier,
stable, or better value.

Also includes a quick two-pack comparator for standing in the aisle wondering if the
family size is actually cheaper per gram (sometimes it isn't).

- No signup, nothing to install - pure static HTML/JS; everything persists in `localStorage`
- `engine.js` holds the unit-price and event-detection math as pure functions, shared
  between the app and node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite covers unit pricing, pack comparison (winner, tie, diff%), shrink /
shrink-plus / price-up / value-up event detection, verdicts, unsorted-history
ordering, and cumulative multi-purchase change.
