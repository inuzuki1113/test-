import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("dogeunblocker-lite-v2/static"));
app.use(express.json());

const urlMap = {}; // ランダム文字列 → 実際のURL

// フロントから送られたURLを登録
app.post("/register", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("URLが必要です");

  const key = crypto.randomBytes(4).toString("hex"); // 8文字ランダム
  urlMap[key] = url.replace(/^https?:\/\//, "");
  res.json({ key });
});

// ランダム文字列でアクセスされたらプロキシ
app.use("/proxy/:key", (req, res, next) => {
  const targetUrl = urlMap[req.params.key];
  if (!targetUrl) return res.status(404).send("無効なURLキーです");

  createProxyMiddleware({
    target: `https://${targetUrl}`,
    changeOrigin: true,
    pathRewrite: { "^/proxy": "" }
  })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`✅ DogeUnblocker Lite v2 running on port ${PORT}`);
});
