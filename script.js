const nav = document.querySelector("[data-nav]");
const form = document.getElementById("interestForm");
const resultBox = document.getElementById("resultBox");
const topicButtons = document.querySelectorAll("[data-topic]");

function updateHeader() {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 20);
}

function setInterest(value) {
  const select = form?.elements?.interest;
  if (!select) return;

  const mapping = {
    "想改善家中清潔用品": "居家清潔",
    "想了解營養保健與日常補給": "營養保健",
    "想找個人保養與身體照護": "個人保養",
    "想整理家庭固定消耗品": "家庭日用品"
  };

  select.value = mapping[value] || select.value;
  if (form.elements.note && !form.elements.note.value.trim()) {
    form.elements.note.value = value;
  }
}

topicButtons.forEach((button) => {
  button.addEventListener("click", () => {
    topicButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    setInterest(button.dataset.topic);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const name = data.name.trim();
  const note = data.note.trim() || "目前想先了解適合自己的入門方向。";

  resultBox.textContent = `您好，我是 ${name}，想了解美樂家「${data.interest}」相關產品。\n我的需求是：${note}\n請協助我用藍星科技的 AI 生活分享流程，整理適合我的產品分類與後續諮詢建議。`;
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
