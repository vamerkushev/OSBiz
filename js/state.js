let activeId = db.businesses[0].id,
  reportMonth = null,
  editing = false;
function save() {
  localStorage.setItem("osbiz_db", JSON.stringify(db));
}
function biz() {
  return db.businesses.find((x) => x.id === activeId) || db.businesses[0];
}
function reports() {
  return [...biz().reports].sort((a, b) => a.month.localeCompare(b.month));
}
function latest() {
  return reports().at(-1) || null;
}
