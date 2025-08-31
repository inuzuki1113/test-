const urlInput = document.getElementById("urlInput");
const goBtn = document.getElementById("goBtn");

// GoボタンでURL登録
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
    window.location.href = `/proxy/${data.key}`; // ランダム文字列に飛ばす
  } catch (err) {
    alert("登録エラー: " + err.message);
  }
});
