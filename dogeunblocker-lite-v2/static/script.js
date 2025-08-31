const urlInput = document.getElementById("urlInput");
const goBtn = document.getElementById("goBtn");
const bmInput = document.getElementById("bmInput");
const bmList = document.getElementById("bookmarkList");

// --- Dark Mode Toggle ---
const body = document.body;
const darkToggle = document.getElementById("darkToggle");

darkToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  localStorage.setItem("dark", body.classList.contains("dark"));
});

if (localStorage.getItem("dark") === "true") body.classList.add("dark");

// --- URL登録＆Go ---
goBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return;

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    window.location.href = `/proxy/${data.key}`;
  } catch (err) {
    alert("登録エラー: " + err.message);
  }
});

// --- Bookmark ---
function loadBookmarks() {
  bmList.innerHTML = "";
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bookmarks.forEach((bm, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="/proxy/${bm.key}">${bm.url}</a> 
                    <button onclick="removeBm(${i})">❌</button>`;
    bmList.appendChild(li);
  });
}

function saveBookmark(url, key) {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bookmarks.push({ url, key });
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  loadBookmarks();
}

function removeBm(i) {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bookmarks.splice(i, 1);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  loadBookmarks();
}

document.getElementById("addBmBtn").addEventListener("click", async () => {
  if (!bmInput.value.trim()) return;

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: bmInput.value.trim() })
    });
    const data = await res.json();
    saveBookmark(bmInput.value.trim(), data.key);
    bmInput.value = "";
  } catch (err) {
    alert("登録エラー: " + err.message);
  }
});

loadBookmarks();
