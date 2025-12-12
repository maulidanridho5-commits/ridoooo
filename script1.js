const PASSWORD = "rido123";
let students = [
  { name: "Rido Saputra", nim: "23011001", major: "Teknik Informatika", email: "rido.saputra@example.com" },
  { name: "Alya Pratiwi", nim: "23011002", major: "Sistem Informasi", email: "alya.pratiwi@example.com" },
  { name: "Dimas Wiratama", nim: "23011003", major: "Teknik Komputer", email: "dimas.wira@example.com" },
];
let sortField = "name";
let sortDirection = "asc"; // "asc" or "desc"

const tableBody = document.getElementById("tableBody");
const studentForm = document.getElementById("studentForm");
const editIndexInput = document.getElementById("editIndex");
const statusText = document.getElementById("statusText");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const sortFieldSelect = document.getElementById("sortField");
const ascBtn = document.getElementById("ascBtn");
const descBtn = document.getElementById("descBtn");
const loginOverlay = document.getElementById("loginOverlay");
const loginCard = document.getElementById("loginCard");
const loginStatus = document.getElementById("loginStatus");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const toastEl = document.getElementById("toast");
const welcomeSplash = document.getElementById("welcomeSplash");
const farewellSplash = document.getElementById("farewellSplash");
let toastTimer;

const nameInput = document.getElementById("name");
const nimInput = document.getElementById("nim");
const majorInput = document.getElementById("major");
const emailInput = document.getElementById("email");

function renderTable() {
  const sorted = [...students].sort((a, b) => {
    const valA = (a[sortField] || "").toString().toLowerCase();
    const valB = (b[sortField] || "").toString().toLowerCase();
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  tableBody.innerHTML = "";
  sorted.forEach((student, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.nim}</td>
      <td>${student.major}</td>
      <td>${student.email}</td>
      <td>
        <div class="actions">
          <button type="button" class="muted-btn" data-action="edit" data-index="${idx}">Edit</button>
          <button type="button" class="muted-btn danger" data-action="delete" data-index="${idx}">Hapus</button>
        </div>
      </td>
    `;
    tr.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", (e) => handleAction(e, sorted, idx));
    });
    tableBody.appendChild(tr);
  });

  document.querySelectorAll("th").forEach(th => th.classList.remove("active"));
  const activeHeader = document.querySelector(`th[data-field="${sortField}"]`);
  if (activeHeader) {
    activeHeader.classList.add("active");
    activeHeader.querySelector(".sort-indicator").textContent = sortDirection === "asc" ? "↑" : "↓";
  }
}

function handleAction(event, currentList, visualIndex) {
  const action = event.target.dataset.action;
  const student = currentList[visualIndex];
  const realIndex = students.findIndex(s => s.nim === student.nim && s.email === student.email);
  if (action === "delete") {
    students.splice(realIndex, 1);
    statusText.textContent = `Data ${student.name} dihapus.`;
    renderTable();
  }
  if (action === "edit") {
    editIndexInput.value = realIndex;
    nameInput.value = student.name;
    nimInput.value = student.nim;
    majorInput.value = student.major;
    emailInput.value = student.email;
    submitBtn.textContent = "Update";
    statusText.textContent = `Edit mode: ${student.name}`;
    nameInput.focus();
  }
}

studentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const payload = {
    name: nameInput.value.trim(),
    nim: nimInput.value.trim(),
    major: majorInput.value.trim(),
    email: emailInput.value.trim(),
  };
  if (!payload.name || !payload.nim || !payload.major || !payload.email) {
    statusText.textContent = "Lengkapi seluruh field.";
    return;
  }
  const editIndex = editIndexInput.value;
  if (editIndex !== "") {
    students[Number(editIndex)] = payload;
    statusText.textContent = `Data ${payload.name} diperbarui.`;
  } else {
    students.push(payload);
    statusText.textContent = `Data ${payload.name} ditambahkan.`;
  }
  resetForm();
  renderTable();
});

resetBtn.addEventListener("click", resetForm);

function resetForm() {
  studentForm.reset();
  editIndexInput.value = "";
  submitBtn.textContent = "Simpan";
  statusText.textContent = "Form direset.";
}

ascBtn.addEventListener("click", () => {
  sortDirection = "asc";
  sortField = sortFieldSelect.value;
  renderTable();
  statusText.textContent = `Diurutkan ${sortFieldSelect.options[sortFieldSelect.selectedIndex].text} secara ascending.`;
});

descBtn.addEventListener("click", () => {
  sortDirection = "desc";
  sortField = sortFieldSelect.value;
  renderTable();
  statusText.textContent = `Diurutkan ${sortFieldSelect.options[sortFieldSelect.selectedIndex].text} secara descending.`;
});

document.querySelectorAll("th[data-field]").forEach(th => {
  th.addEventListener("click", () => {
    const field = th.dataset.field;
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "asc";
      sortFieldSelect.value = field;
    }
    renderTable();
    statusText.textContent = `Kolom ${field} diurutkan ${sortDirection}.`;
  });
});

function requireLogin() {
  const token = sessionStorage.getItem("mahasiswa_authed");
  if (token === "yes") {
    loginOverlay.classList.add("hidden");
    return;
  }
  loginOverlay.classList.remove("hidden");
}

loginBtn.addEventListener("click", checkPassword);
loginPassword.addEventListener("keyup", (e) => {
  if (e.key === "Enter") checkPassword();
});
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("mahasiswa_authed");
  statusText.textContent = "Logout. Sampai jumpa lagi!";
  flashStatus();
  showToast("Sampai jumpa lagi!", "info");
  showSplash("farewell", () => {
    loginOverlay.classList.remove("hidden");
    loginPassword.focus();
  });
});

function checkPassword() {
  const val = loginPassword.value.trim();
  if (val === PASSWORD) {
    sessionStorage.setItem("mahasiswa_authed", "yes");
    loginOverlay.classList.add("hidden");
    loginStatus.textContent = "Berhasil login.";
    statusText.textContent = "Login berhasil. Selamat datang!";
    flashStatus();
    showToast("Selamat datang!", "success");
    showSplash("welcome");
  } else {
    loginCard.classList.remove("shake");
    void loginCard.offsetWidth; // restart animation
    loginCard.classList.add("shake");
    loginStatus.innerHTML = '<span class="danger">Password salah.</span>';
    loginPassword.focus();
  }
}

function showToast(message, type = "info") {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2200);
}

function flashStatus() {
  statusText.classList.remove("flash");
  void statusText.offsetWidth;
  statusText.classList.add("flash");
}

function showSplash(type, onDone) {
  const target = type === "welcome" ? welcomeSplash : farewellSplash;
  if (!target) return;
  target.classList.add("show");
  setTimeout(() => {
    target.classList.remove("show");
    if (onDone) onDone();
  }, 1700);
}

// Initial render
renderTable();
requireLogin();

