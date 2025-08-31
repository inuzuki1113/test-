import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import crypto from "crypto";
import { Buffer } from "buffer";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("dogeunblocker-lite-v2/static"));
app.use(express.json());

const urlMap = {}; // ランダムキー → 実際のURL

// --- URL登録API ---
app.post("/register", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("URLが必要です");

  const key = crypto.randomBytes(4).toString("hex"); // 8文字ランダム
  urlMap[key] = url.replace(/^https?:\/\//, "");
  res.json({ key });
});

// --- 動的プロキシ ---
app.use("/proxy/:key/*?", (req, res, next) => {
  const targetKey = req.params.key;
  const targetUrl = urlMap[targetKey];
  if (!targetUrl) return res.status(404).send("無効なURLキーです");

  const proxy = createProxyMiddleware({
    target: `https://${targetUrl}`,
    changeOrigin: true,
    selfHandleResponse: true, // レスポンスを自分で操作
    onProxyRes(proxyRes, req2, res2) {
      const chunks = [];
      proxyRes.on("data", (chunk) => chunks.push(chunk));
      proxyRes.on("end", () => {
        let body = Buffer.concat(chunks);
        const contentType = proxyRes.headers['content-type'] || "";

        // HTML / JS / CSS はテキストとして書き換え
        if (contentType.includes("text/html") || contentType.includes("application/javascript") || contentType.includes("text/css")) {
          body = body.toString("utf8");

          // URL置換: href / src / import / require / fetch / axios なども対象
          body = body.replace(/(["'`])https?:\/\/([^\/"'`]+)/g, (match, quote, host) => {
            const newKey = crypto.randomBytes(4).toString("hex");
            urlMap[newKey] = host;
            return `${quote}/proxy/${newKey}`;
          });

          res2.setHeader("content-type", contentType);
          res2.send(body);
          return;
        }

        // 画像・動画などはそのまま返す
        Object.keys(proxyRes.headers).forEach((key) => {
          res2.setHeader(key, proxyRes.headers[key]);
        });
        res2.status(proxyRes.statusCode).send(body);
      });
    }
  });

  proxy(req, res, next);
});

app.listen(PORT, () => {
  console.log(`✅ DogeUnblocker Lite v2 (JS対応版) running on port ${PORT}`);
});
