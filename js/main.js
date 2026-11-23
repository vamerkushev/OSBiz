function renderAll() {
  renderDashboard();
  renderReports();
  renderProfile();
  $("topAvatar").innerHTML = avatarHTML(db.user.name);
}
$("topAvatar").onclick = () => showPage("profile");
$("sidebarToggle").onclick = () => {
  let hidden = document.body.classList.toggle("sidebar-hidden");
  localStorage.setItem("osbiz_sidebar", hidden ? "hidden" : "shown");
};
if (localStorage.getItem("osbiz_sidebar") === "hidden")
  document.body.classList.add("sidebar-hidden");
renderAll();
