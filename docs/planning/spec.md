# 規格書

## 目標
- 提供專業級、閱讀體驗佳且速度快的部落格。
- 提供安全的後台管理與內容維護流程。
- 具備基本分析與 SEO 輸出。

## 非目標
- 多租戶 SaaS 或付費訂閱系統。
- 超過 Markdown/HTML 的進階 WYSIWYG 編輯器。

## 使用者角色
- 訪客 / 讀者
- 留言者
- 管理員 / 編輯

## 功能需求 - 公開網站
- 首頁含精選、最新文章與分類導覽。
- 文章列表頁具備分頁與篩選。
- 文章詳情包含標籤、閱讀時間、瀏覽數、評論。
- 分類與標籤索引頁與詳情頁。
- 搜尋頁以 query 參數呈現結果。
- 關於頁。
- 全站 Header / Footer / 導覽。

## 功能需求 - 內容渲染
- Markdown 轉 HTML 並支援語法高亮。
- 以白名單清洗輸出，避免 XSS。
- 目錄（TOC）與標題錨點。
- 圖片最佳化與響應式排版。

## 功能需求 - 評論
- 匿名留言並需審核。
- 支援回覆與回覆深度限制。
- 具備反垃圾與限流。
- Email 與網站欄位可選。

## 功能需求 - 後台
- NextAuth 帳密登入。
- 儀表板顯示文章、評論、瀏覽統計。
- 文章、分類、標籤 CRUD。
- 發佈、取消發佈與排程發佈。
- 評論審核（批准、取消、刪除）。
- 分析頁與匯出。
- 設定頁（站名、描述、SEO 預設）。

## 功能需求 - 分析
- 追蹤瀏覽事件（path、referrer、userAgent、country）。
- 依日期彙整與熱門文章排行。
- 搜尋行為統計。

## 功能需求 - SEO
- 各頁 Metadata 與 Open Graph。
- 文章頁 JSON-LD。
- RSS feed、sitemap.xml、robots.txt。
- Canonical URL。

## 資料模型擴充
- Post: publishedAt、seoTitle、seoDescription、canonicalUrl、readingTime。
- Comment: ip、userAgent、status。
- Analytics: eventType、referrer、path、device。
- Settings: siteName、siteDescription、socialLinks。

## 非功能需求
- 效能：對發佈內容使用快取，TTFB 目標 < 300ms。
- 安全：避免 stored XSS、嚴格權限控制、留言限流。
- 無障礙：鍵盤可操作且有明顯焦點。
- 可觀測性：伺服器記錄與錯誤追蹤。

## 約束
- 技術堆疊：Next.js App Router、Prisma、PostgreSQL、NextAuth、Tailwind。
- MVP 避免過度綁定單一供應商。
