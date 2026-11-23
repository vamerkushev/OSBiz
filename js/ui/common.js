function toast(s) {
  $("toast").textContent = s;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 1900);
}
function showPage(p) {
  document
    .querySelectorAll(".page")
    .forEach((x) => x.classList.toggle("active", x.id === "page-" + p));
  document
    .querySelectorAll("[data-page]")
    .forEach((x) => x.classList.toggle("active", x.dataset.page === p));
  if (p === "profile") renderProfile();
  if (p === "reports") renderReports();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document
  .querySelectorAll("[data-page]")
  .forEach((x) => x.addEventListener("click", () => showPage(x.dataset.page)));
function renderSwitch() {
  let el = $("businessSwitch");
  if (db.businesses.length < 2) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML =
    '<span class="sub">Бизнес</span><select id="businessSelect">' +
    db.businesses
      .map(
        (b) =>
          `<option value="${b.id}" ${b.id === activeId ? "selected" : ""}>${esc(b.name)}</option>`,
      )
      .join("") +
    "</select>";
  $("businessSelect").onchange = (e) => {
    activeId = e.target.value;
    renderAll();
  };
}
document
  .querySelectorAll("[data-close]")
  .forEach(
    (x) => (x.onclick = () => $(x.dataset.close).classList.remove("show")),
  );
