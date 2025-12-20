# 任務清單

## P0 - 安全、可靠性、上線準備
- 對所有 /admin 頁面與 /api/admin 路由加上角色權限控管，非管理員一律回 403。
- 對 Markdown 與 HTML 輸出做白名單清洗，同時保留程式碼高亮。
- 修正瀏覽數重複計數；每位使用者每篇文章在單一工作階段最多 +1，忽略 prefetch。
- 新增 RSS feed、sitemap.xml 與 robots.txt。
- 補齊 /admin/settings 頁面，或移除側欄連結避免 404。
- 在啟動時驗證必要環境變數（DATABASE_URL、NEXTAUTH_SECRET）。
- 將依賴版本調整到正式支援的 Next.js 與 React 版本。
- 對管理與評論 API 加入請求驗證（schema validation）。

## P1 - 內容與編輯流程
- 新增排程發佈（publishAt）與草稿流程。
- 未發佈文章支援預覽連結。
- 摘要為空時自動由 Markdown 產生。
- 文章頁新增目錄（TOC）與標題錨點。
- 新增媒體上傳與管理（封面與內文圖片）。
- 相關文章與下一篇推薦。

## P1 - 評論與社群
- 加入限流與反垃圾（honeypot 或 captcha）。
- 新評論通知寄送給管理員。
- 評論分頁與回覆深度限制。

## P1 - 搜尋與可發現性
- 加入全文搜尋（Postgres tsvector）與關鍵字高亮。
- /posts 加入篩選與排序（分類、標籤、日期）。
- 搜尋行為分析（熱門查詢、零結果查詢）。

## P2 - 分析與成長
- 追蹤頁面瀏覽（referrer、device、country、path）。
- 儀表板圖表與 CSV 匯出。
- 電子報訂閱整合。

## P2 - 品質與維運
- 增加測試（utils 單元、API 整合、關鍵流程 e2e）。
- 加入錯誤監控與結構化記錄。
- 建立 CI 流程（lint、typecheck、build、test）。
