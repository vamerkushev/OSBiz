function renderReports() {
  let rs = reports();
  $("reportsBusinessName").textContent = biz().name + " · " + biz().type;
  $("reportMonthSelect").innerHTML =
    rs
      .slice()
      .reverse()
      .map((r) => `<option value="${r.month}">${monthName(r.month)}</option>`)
      .join("") || '<option value="">Нет отчётов</option>';
  if (!reportMonth || !rs.some((r) => r.month === reportMonth))
    reportMonth = rs.at(-1)?.month || null;
  $("reportMonthSelect").value = reportMonth || "";
  showReportData();
  $("reportTable").innerHTML = rs.length
    ? `<table class="table"><thead><tr><th>Период</th><th>Выручка</th><th>Доступные метрики</th><th></th></tr></thead><tbody>${rs
        .slice()
        .reverse()
        .map(
          (r) =>
            `<tr><td>${monthName(r.month)}</td><td>${r.revenue !== undefined ? rub(r.revenue) : "—"}</td><td>${metricRows(r).length}</td><td><button class="btn small" onclick="selectReport('${r.month}')">Открыть</button></td></tr>`,
        )
        .join("")}</tbody></table>`
    : '<div class="empty">Отчётов пока нет. Создайте первый отчёт.</div>';
}
function selectReport(m) {
  reportMonth = m;
  $("reportMonthSelect").value = m;
  showReportData();
}
function showReportData() {
  let r = reports().find((x) => x.month === reportMonth);
  $("reportHeading").textContent = r
    ? `Показатели за ${monthName(r.month)}`
    : "Нет выбранного отчёта";
  $("reportMetrics").innerHTML =
    metricRows(r)
      .map(
        ([n, v]) => `<div class="data-row"><span>${n}</span><b>${v}</b></div>`,
      )
      .join("") ||
    '<div class="empty" style="grid-column:1/-1">Для этого периода нет доступных показателей</div>';
  $("editReportBtn").disabled = !r;
}
$("reportMonthSelect").onchange = (e) => {
  reportMonth = e.target.value;
  showReportData();
};
function openReport(edit = false) {
  editing = edit;
  let r = edit ? reports().find((x) => x.month === reportMonth) : null;
  $("reportModalTitle").textContent = edit
    ? "Редактировать отчёт"
    : "Новый месячный отчёт";
  let html = `<div class="field" style="grid-column:1/-1"><label>Отчётный месяц</label><input id="f_month" type="month" value="${r?.month || ym}"></div>`;
  let section = "";
  fields.forEach(([group, k, label]) => {
    if (section !== group) {
      section = group;
      html += `<div class="form-section" style="grid-column:1/-1">${group}</div>`;
    }
    html += `<div class="field"><label>${label}</label><input id="f_${k}" type="number" min="0" step="any" placeholder="Необязательно" value="${r?.[k] ?? ""}"></div>`;
  });
  $("reportFields").innerHTML = html;
  $("reportModal").classList.add("show");
}
$("newReportBtn").onclick = () => openReport(false);
$("editReportBtn").onclick = () => openReport(true);
$("saveReport").onclick = () => {
  let month = $("f_month").value;
  if (!month) {
    toast("Выберите месяц");
    return;
  }
  let r = { month };
  fields.forEach(([g, k]) => {
    let val = $("f_" + k).value;
    if (val !== "") r[k] = Number(val);
  });
  if (Object.keys(r).length === 1) {
    toast("Заполните хотя бы одно поле");
    return;
  }
  let b = biz(),
    idx = b.reports.findIndex((x) => x.month === month);
  if (idx >= 0) b.reports[idx] = { ...b.reports[idx], ...r };
  else b.reports.push(r);
  reportMonth = month;
  save();
  $("reportModal").classList.remove("show");
  renderAll();
  showPage("reports");
  toast("Отчёт сохранён");
};
