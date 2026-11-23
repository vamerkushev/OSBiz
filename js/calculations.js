function calc(r) {
  if (!r) return {};
  const v = (k) => r[k],
    has = (...ks) =>
      ks.every((k) => v(k) !== undefined && v(k) !== null && v(k) !== "");
  let o = { ...r };
  if (has("revenue", "cogs")) o.grossProfit = v("revenue") - v("cogs");
  if (has("grossProfit", "revenue") && v("revenue"))
    o.grossMargin = (o.grossProfit / v("revenue")) * 100;
  if (has("revenue", "cogs", "operatingExpenses"))
    o.operatingProfit = v("revenue") - v("cogs") - v("operatingExpenses");
  if (has("operatingProfit", "revenue") && v("revenue"))
    o.operatingMargin = (o.operatingProfit / v("revenue")) * 100;
  if (has("operatingProfit", "depreciation"))
    o.ebitda = o.operatingProfit + v("depreciation");
  if (
    has("revenue", "cogs", "operatingExpenses", "taxes", "interest") &&
    v("revenue")
  )
    o.netMargin =
      ((v("revenue") -
        v("cogs") -
        v("operatingExpenses") -
        v("taxes") -
        v("interest")) /
        v("revenue")) *
      100;
  if (
    has("fixedCosts", "variableCosts", "revenue") &&
    v("revenue") > v("variableCosts")
  )
    o.breakEven = v("fixedCosts") / (1 - v("variableCosts") / v("revenue"));
  if (has("currentAssets", "shortLiabilities") && v("shortLiabilities"))
    o.currentRatio = v("currentAssets") / v("shortLiabilities");
  if (
    has("currentAssets", "inventory", "shortLiabilities") &&
    v("shortLiabilities")
  )
    o.quickRatio =
      (v("currentAssets") - v("inventory")) / v("shortLiabilities");
  if (has("cogs", "avgInventory") && v("avgInventory"))
    o.inventoryTurnover = v("cogs") / v("avgInventory");
  if (has("revenue", "clients") && v("clients"))
    o.arpu = v("revenue") / v("clients");
  if (has("marketing", "newClients") && v("newClients"))
    o.cac = v("marketing") / v("newClients");
  if (has("arpu", "grossMargin", "customerLifetime"))
    o.ltv = o.arpu * (o.grossMargin / 100) * v("customerLifetime");
  if (has("sales", "leads") && v("leads"))
    o.conversion = (v("sales") / v("leads")) * 100;
  if (has("clientsStart", "newClients", "clients") && v("clientsStart"))
    o.retention = Math.max(
      0,
      ((v("clients") - v("newClients")) / v("clientsStart")) * 100,
    );
  if (has("lostClients", "clientsStart") && v("clientsStart"))
    o.churn = (v("lostClients") / v("clientsStart")) * 100;
  if (has("revenue", "planRevenue") && v("planRevenue"))
    o.planFulfillment = (v("revenue") / v("planRevenue")) * 100;
  if (has("revenue", "employees") && v("employees"))
    o.revenuePerEmployee = v("revenue") / v("employees");
  return o;
}
function formatValue(v, unit) {
  return unit === "%"
    ? percent(v)
    : unit === "x"
      ? num(v) + "x"
      : unit === "₽"
        ? rub(v)
        : num(v);
}
function metricRows(r) {
  let c = calc(r);
  return meta
    .filter(([n, k]) => c[k] !== undefined && Number.isFinite(c[k]))
    .map(([n, k, u]) => [n, formatValue(c[k], u), k]);
}
function monthName(s) {
  let [y, m] = s.split("-");
  return `${MONTHS[+m - 1]} ${y}`;
}
