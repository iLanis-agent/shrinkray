/* ShrinkRay engine - shrinkflation math, pure functions.
   Shrinkflation: the price stays, the package shrinks - a hidden price hike.
   What matters is price per unit and how it moved between purchases. */
(function (global) {
  'use strict';

  function round2(x) { return Math.round(x * 100) / 100; }
  function round4(x) { return Math.round(x * 10000) / 10000; }

  // price per 100 units of size (g, ml, count - caller's choice)
  function unitPrice(price, size) {
    if (!(price > 0) || !(size > 0)) throw new Error('price and size must be > 0');
    return round4(price / size * 100);
  }

  // Compare two package options: which is the better value and by how much %.
  function compare(priceA, sizeA, priceB, sizeB) {
    var ua = unitPrice(priceA, sizeA), ub = unitPrice(priceB, sizeB);
    if (ua === ub) return { winner: 'tie', diffPct: 0, unitA: ua, unitB: ub };
    var aWins = ua < ub;
    var diffPct = round2(Math.abs(ua - ub) / Math.max(ua, ub) * 100);
    return { winner: aWins ? 'A' : 'B', diffPct: diffPct, unitA: ua, unitB: ub };
  }

  // One product's purchase history: [{date:'YYYY-MM-DD', price, size}], any order.
  // Detect shrink/price events between consecutive purchases.
  function analyze(history) {
    if (!history.length) return { events: [], firstUnit: null, lastUnit: null, changePct: null };
    var h = history.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var events = [];
    for (var i = 1; i < h.length; i++) {
      var prev = h[i - 1], cur = h[i];
      var sizePct = round2((cur.size - prev.size) / prev.size * 100);   // negative = shrank
      var pricePct = round2((cur.price - prev.price) / prev.price * 100); // positive = price up
      var upPrevRaw = prev.price / prev.size, upCurRaw = cur.price / cur.size;
      var unitPct = round2((upCurRaw - upPrevRaw) / upPrevRaw * 100);     // positive = effectively pricier
      var kind = null;
      if (sizePct < 0 && pricePct <= 5) kind = 'shrink';       // smaller pack, price flat-ish: classic shrinkflation
      else if (sizePct < 0) kind = 'shrink-plus';              // smaller AND pricier
      else if (unitPct > 5) kind = 'price-up';                 // same pack, price up
      else if (unitPct < -5) kind = 'value-up';                // actually better value
      if (kind) events.push({ fromDate: prev.date, toDate: cur.date, kind: kind, sizePct: sizePct, pricePct: pricePct, unitPct: unitPct });
    }
    var first = unitPrice(h[0].price, h[0].size), last = unitPrice(h[h.length - 1].price, h[h.length - 1].size);
    var firstRaw = h[0].price / h[0].size, lastRaw = h[h.length - 1].price / h[h.length - 1].size;
    var changePct = h.length > 1 ? round2((lastRaw - firstRaw) / firstRaw * 100) : null;
    return { events: events, firstUnit: first, lastUnit: last, changePct: changePct, sorted: h };
  }

  // Verdict for the whole history
  function verdict(analysis) {
    if (analysis.changePct === null) return 'tracking';
    if (analysis.events.some(function (e) { return e.kind === 'shrink' || e.kind === 'shrink-plus'; })) return 'shrinkflated';
    if (analysis.changePct >= 10) return 'pricier';
    if (analysis.changePct <= -10) return 'cheaper';
    return 'stable';
  }

  var api = { unitPrice: unitPrice, compare: compare, analyze: analyze, verdict: verdict };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.ShrinkRay = api;
})(typeof window !== 'undefined' ? window : globalThis);
