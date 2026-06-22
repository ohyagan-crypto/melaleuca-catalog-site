const nav = document.querySelector("[data-nav]");
const form = document.getElementById("interestForm");
const resultBox = document.getElementById("resultBox");
const topicButtons = document.querySelectorAll("[data-topic]");
const tabButtons = document.querySelectorAll("[data-work-tab]");
const tabPanels = document.querySelectorAll("[data-work-panel]");
const exportButton = document.querySelector("[data-export]");
const importButton = document.querySelector("[data-import]");
const clearButton = document.querySelector("[data-clear]");
const backupFile = document.getElementById("backupFile");
const backupStatus = document.querySelector("[data-backup-status]");

const STORAGE_KEY = "melaleucaSiteData";

function updateHeader() {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 20);
}

function getStoredData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStoredData(nextData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
}

function setStatus(message) {
  if (backupStatus) backupStatus.textContent = message;
}

function setInterest(value) {
  const select = form?.elements?.interest;
  if (!select) return;

  const mapping = {
    想改善家中清潔用品: "居家清潔",
    想了解營養保健與日常補充: "營養保健",
    想找個人保養與身體照護: "個人保養",
    想整理家庭固定消耗品: "家庭日用品",
  };

  select.value = mapping[value] || select.value;
  if (form.elements.note && !form.elements.note.value.trim()) {
    form.elements.note.value = value;
  }
}

function activateWorkTab(tabName) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.workTab === tabName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.workPanel !== tabName);
  });
}

function collectBackupData() {
  const formData = form ? Object.fromEntries(new FormData(form).entries()) : {};
  return {
    exportedAt: new Date().toISOString(),
    form: formData,
    resultText: resultBox?.textContent || "",
    savedData: getStoredData(),
  };
}

function downloadBackup() {
  const data = collectBackupData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  link.href = url;
  link.download = `melaleuca-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("已匯出備份檔。請保留這份檔案，之後可用匯入備份還原本頁資料。");
}

async function importBackup(file) {
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.form && form) {
      Object.entries(data.form).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value;
      });
    }

    if (data.resultText && resultBox) {
      resultBox.textContent = data.resultText;
    }

    if (data.savedData) {
      saveStoredData(data.savedData);
    }

    setStatus("備份已匯入，表單與已儲存資料已更新。");
  } catch {
    setStatus("匯入失敗：檔案格式不符合本頁備份資料。");
  } finally {
    backupFile.value = "";
  }
}

function clearData() {
  const ok = window.confirm("確定要清空本頁暫存資料嗎？這不會刪除網站檔案。");
  if (!ok) return;

  localStorage.removeItem(STORAGE_KEY);
  form?.reset();
  if (resultBox) {
    resultBox.textContent = "資料已清空。可以重新填寫諮詢內容。";
  }
  setStatus("本機暫存資料已清空。");
}

topicButtons.forEach((button) => {
  button.addEventListener("click", () => {
    topicButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    setInterest(button.dataset.topic);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateWorkTab(button.dataset.workTab));
});

exportButton?.addEventListener("click", downloadBackup);
importButton?.addEventListener("click", () => backupFile?.click());
clearButton?.addEventListener("click", clearData);
backupFile?.addEventListener("change", () => importBackup(backupFile.files?.[0]));

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const name = data.name.trim();
  const note = data.note.trim() || "目前想先了解適合自己的入門方向。";

  const message = `您好，我是 ${name}，想了解美樂家「${data.interest}」相關產品。
我的需求是：${note}
請協助我用藍星科技的 AI 生活分享流程，整理適合我的產品分類與後續諮詢建議。`;

  resultBox.textContent = message;
  saveStoredData({
    lastLead: {
      name,
      interest: data.interest,
      note,
      message,
      updatedAt: new Date().toISOString(),
    },
  });
});

activateWorkTab("home");
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
