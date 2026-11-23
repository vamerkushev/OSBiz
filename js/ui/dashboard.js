function renderDashboard() {
  let b = biz(),
    rs = reports(),
    r = latest(),
    c = calc(r);
  $("dashTitle").textContent = b.name;
  $("dashSub").textContent = `${b.type} · аналитика и финансовые показатели`;
  $("lastPeriod").textContent = r ? monthName(r.month) : "Нет данных";
  renderSwitch();
  let metrics = [
    ["Выручка", "revenue", "₽"],
    ["Чистая прибыль", "netProfit", "₽"],
    ["Рентабельность", "netMargin", "%"],
    ["ROI", "roi", "%"],
  ];
  let derived = { ...c };
  if (
    r &&
    r.revenue !== undefined &&
    r.cogs !== undefined &&
    r.operatingExpenses !== undefined &&
    r.taxes !== undefined &&
    r.interest !== undefined
  )
    derived.netProfit =
      r.revenue - r.cogs - r.operatingExpenses - r.taxes - r.interest;
  if (r && r.investments && derived.netProfit !== undefined)
    derived.roi = (derived.netProfit / r.investments) * 100;
  $("mainMetrics").innerHTML =
    metrics
      .filter(
        (x) => derived[x[1]] !== undefined && Number.isFinite(derived[x[1]]),
      )
      .map(
        ([label, k, u]) =>
          `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value">${formatValue(derived[k], u)}</div><div class="metric-change">${k === "revenue" ? "За последний отчёт" : k === "netProfit" ? (derived[k] >= 0 ? "Положительный финансовый результат" : "Убыток") : k === "roi" ? "Рентабельность инвестиций" : "Доля прибыли в выручке"}</div></div>`,
      )
      .join("") ||
    '<div class="panel empty" style="grid-column:1/-1">Добавьте отчёт с финансовыми данными — показатели появятся автоматически.</div>';
  let quick = [
    ["Клиенты", c.clients, "шт."],
    ["CAC", c.cac, "₽"],
    ["Текущая ликвидность", c.currentRatio, "x"],
    ["Выполнение плана", c.planFulfillment, "%"],
  ];
  $("quickStats").innerHTML =
    quick
      .filter((x) => c[x[1]] !== undefined)
      .map(
        ([l, k, u]) =>
          `<div class="summary-item"><span>${l}</span><b>${formatValue(c[k], u)}</b></div>`,
      )
      .join("") ||
    '<div class="empty" style="grid-column:1/-1">Недостаточно данных</div>';
  $("insight").innerHTML = r
    ? `<strong>${r.revenue !== undefined ? "Финансовый срез сформирован." : "Отчёт сохранён."}</strong> ${c.netMargin !== undefined ? `Чистая рентабельность — ${percent(c.netMargin)}.` : "Добавьте данные о себестоимости, расходах и налогах для расчёта чистой рентабельности."}`
    : "Добавьте первый месячный отчёт.";
  $("availableMetrics").innerHTML =
    metricRows(r)
      .map(
        ([n, v]) => `<div class="data-row"><span>${n}</span><b>${v}</b></div>`,
      )
      .join("") ||
    '<div class="empty" style="grid-column:1/-1">Пока нет рассчитанных метрик</div>';
  $("recentReports").innerHTML =
    rs
      .slice()
      .reverse()
      .slice(0, 5)
      .map(
        (x) =>
          `<div class="data-row"><span>${monthName(x.month)}</span><b>${x.revenue !== undefined ? rub(x.revenue) : "—"}</b></div>`,
      )
      .join("") || '<div class="empty">Нет отчётов</div>';
  drawChart(rs);
}
function drawChart(rs) {
  let arr = rs.slice(-12),
    svg = $("mainChart");
  if (!arr.length) {
    svg.innerHTML =
      '<text x="380" y="120" text-anchor="middle" font-size="13" style="fill:var(--muted)">Добавьте месячные отчёты для построения графика</text>';
    return;
  }
  let mode = $("chartMetric").value,
    values = arr.map((r) => {
      let c = calc(r);
      return mode === "margin"
        ? c.netMargin
        : mode === "clients"
          ? c.clients
          : r.revenue;
    }),
    valid = values.filter((v) => v !== undefined && Number.isFinite(v));
  if (!valid.length) {
    svg.innerHTML =
      '<text x="380" y="120" text-anchor="middle" font-size="13" style="fill:var(--muted)">Недостаточно данных для графика</text>';
    return;
  }
  let max = Math.max(...valid, 1),
    min = Math.min(0, ...valid),
    x = (i) => 36 + i * (680 / Math.max(1, arr.length - 1)),
    y = (v) => 210 - ((v - min) / (max - min || 1)) * 175;
  let grid = [35, 80, 125, 170, 210]
    .map(
      (yv) =>
        `<line x1="25" y1="${yv}" x2="740" y2="${yv}" stroke-dasharray="3 6" style="stroke:var(--chart-line)"/>`,
    )
    .join("");
  let segs = "";
  for (let i = 1; i < values.length; i++) {
    if (values[i] === undefined || values[i - 1] === undefined) continue;
    let down = values[i] < values[i - 1],
      col = down ? "var(--red)" : "var(--green)";
    segs += `<line x1="${x(i - 1)}" y1="${y(values[i - 1])}" x2="${x(i)}" y2="${y(values[i])}" stroke-width="3.5" stroke-linecap="round" style="stroke:${col}"/>`;
  }
  let dots = values
    .map((v, i) =>
      v === undefined
        ? ""
        : `<circle cx="${x(i)}" cy="${y(v)}" r="4" style="fill:${i && v < values[i - 1] ? "var(--red)" : "var(--green)"}"/>`,
    )
    .join("");
  let labels = arr
    .map(
      (r, i) =>
        `<text x="${x(i)}" y="239" text-anchor="middle" font-size="10" style="fill:var(--muted)">${MONTHS[+r.month.slice(5) - 1]}</text>`,
    )
    .join("");
  svg.innerHTML = grid + segs + dots + labels;
}
$("chartMetric").onchange = () => drawChart(reports());
$("periodSelect").onchange = () => {
  let n = $("periodSelect").value,
    rs = reports();
  drawChart(n === "all" ? rs : rs.slice(-Number(n)));
};
