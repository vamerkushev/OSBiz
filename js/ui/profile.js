const AVATAR_SVG =
  '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="48" cy="48" r="48" fill="#8f9593"/><circle cx="48" cy="37" r="14.5" fill="#ffffff"/><path d="M48 55c-16.5 0-27.5 10.5-29.5 24.5C27.2 88.6 37.2 94 48 94s20.8-5.4 29.5-14.5C75.5 65.5 64.5 55 48 55Z" fill="#ffffff"/></svg>';
function initials(s) {
  return s
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0] || "")
    .join("")
    .toUpperCase();
}
function avatarHTML(name) {
  return name ? esc(initials(name)) : AVATAR_SVG;
}
function renderProfile() {
  let u = db.user;
  $("profileAvatar").innerHTML = avatarHTML(u.name);
  $("profileDisplayName").textContent = u.name || "Имя не указано";
  $("profileDisplayEmail").textContent = u.email || "Email не указан";
  $("userName").value = u.name;
  $("userEmail").value = u.email;
  $("userRole").value = u.role;
  $("businessCards").innerHTML = db.businesses
    .map(
      (b) =>
        `<div class="business-card"><div><b>${esc(b.name)}</b><small>${esc(b.type)} · ${b.reports.length} отчётов</small></div><div style="display:flex;gap:6px"><button class="btn small" onclick="switchBusiness('${b.id}')">Открыть</button><button class="btn small" onclick="renameBusiness('${b.id}')">Изменить</button></div></div>`,
    )
    .join("");
}
function switchBusiness(id) {
  activeId = id;
  showPage("dashboard");
  renderAll();
}
function renameBusiness(id) {
  let b = db.businesses.find((x) => x.id === id),
    n = prompt("Новое название бизнеса", b.name);
  if (n && n.trim()) {
    b.name = n.trim();
    save();
    renderProfile();
    renderDashboard();
  }
}
$("saveUser").onclick = () => {
  db.user = {
    name: $("userName").value.trim(),
    email: $("userEmail").value.trim(),
    role: $("userRole").value.trim(),
  };
  save();
  renderAll();
  renderProfile();
  toast("Профиль сохранён");
};
$("createBusinessBtn").onclick = () => $("businessModal").classList.add("show");
$("confirmBusiness").onclick = () => {
  let n = $("businessName").value.trim();
  if (!n) {
    toast("Введите название бизнеса");
    return;
  }
  let b = {
    id: "b" + Date.now(),
    name: n,
    type: $("businessType").value,
    reports: [],
  };
  db.businesses.push(b);
  activeId = b.id;
  save();
  $("businessModal").classList.remove("show");
  renderAll();
  renderProfile();
  toast("Бизнес создан");
};
