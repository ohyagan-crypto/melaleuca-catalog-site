const countdown = document.querySelector("[data-countdown]");
const nav = document.querySelector("[data-nav]");

function updateCountdown() {
  if (!countdown) return;

  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  countdown.textContent = `${String(days).padStart(2, "0")}天 ${String(hours).padStart(2, "0")}時 ${String(minutes).padStart(2, "0")}分`;
}

function updateHeader() {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 20);
}

updateCountdown();
updateHeader();
setInterval(updateCountdown, 60000);
window.addEventListener("scroll", updateHeader, { passive: true });
