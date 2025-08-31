import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイル提供
app.use(express.static("dogeunblocker-lite-v2/static"));

// プロキシ設定
app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://example.com",
    changeOrigin: true,
    pathRewrite: { "^/proxy": "" }
  })
);

app.listen(PORT, () => {
  console.log(`✅ DogeUnblocker Lite v2 running on port ${PORT}`);
});
