import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { Buffer } from "buffer";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static("dogeunblocker-lite-v2/static"));
app.use(express.json());

const MAP_FILE = path.join("dogeunblocker-lite-v2", "urlMap.json");

// --- URLマップ読み込み ---
let urlMap = {};
async function loadUrlMap() {
  try {
    const data = await fs.readFile(MAP_FILE, "utf8");
    urlMap = JSON.parse(data);
  } catch (err) {
    urlMap = {};
  }
}
async function saveUrlMap() {
  await fs.writeFile(MAP_FILE, JSON.stringify(urlMap, null, 2));
}

await loadUrlMap();

// --- URL登録API ---
app.post("/register", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("URLが必要です");

  const key = crypto.randomBytes(4).toString("hex");
  urlMap[key] = url.replace(/^https?:\/\//, "");
  await saveUrlMap();
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
    selfHandleResponse: true,
    onProxyRes(proxyRes, req2, res2) {
      const chunks = [];
      proxyRes.on("data", (chunk) => chunks.push(chunk));
      proxyRes.on("end", () => {
        let body = Buffer.concat(chunks);
        const contentType = proxyRes.headers['content-type'] || "";

        if (contentType.includes("text/html") || contentType.includes("application/javascript") || contentType.includes("text/css")) {
          body = body.toString("utf8");

          // HTML/JS内のリンク書き換え
          body = body.replace(/(["'`])https?:\/\/([^\/"'`]+)/g, (match, quote, host) => {
            const newKey = crypto.randomBytes(4).toString("hex");
            urlMap[newKey] = host;
            saveUrlMap(); // 更新を即保存
            return `${quote}/proxy/${newKey}`;
          });

          res2.setHeader("content-type", contentType);
          res2.send(body);
          return;
        }

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
  console.log(`✅ DogeUnblocker Lite v2 (永続化版) running on port ${PORT}`);
});
