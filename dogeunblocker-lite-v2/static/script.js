// --- Dark Mode Toggle ---
const body = document.body;
const darkToggle = document.getElementById("darkToggle");

darkToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  localStorage.setItem("dark", body.classList.contains("dark"));
});

// ページロード時に状態復元
if (localStorage.getItem("dark") === "true") {
  body.classList.add("dark");
}

// --- Proxy Go ---
document.getElementById("goBtn").addEventListener("click", () => {
  const url = document.getElementById("urlInput").value.trim();
  if (url) window.location.href = "/proxy/" + url.replace(/^https?:\/\//, "");
});

// --- Bookmark ---
const bmInput = document.getElementById("bmInput");
const bmList = document.getElementById("bookmarkList");

function loadBookmarks() {
  bmList.innerHTML = "";
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bookmarks.forEach((bm, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="/proxy/${bm.replace(/^https?:\/\//, "")}">${bm}</a> 
                    <button onclick="removeBm(${i})">❌</button>`;
    bmList.appendChild(li);
  });
}

function saveBookmark(url) {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bookmarks.push(url);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  loadBookmarks();
}

function removeBm(i) {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bookmarks.splice(i, 1);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  loadBookmarks();
}

document.getElementById("addBmBtn").addEventListener("click", () => {
  if (bmInput.value.trim()) {
    saveBookmark(bmInput.value.trim());
    bmInput.value = "";
  }
});

loadBookmarks();
