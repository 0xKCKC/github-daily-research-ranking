# GitHub 日研榜

每日用 GitHub 公開資料找出正在上升的 repository，以可解釋分數排序，再產生中文研究摘要。

## 功能

- 今日 Top 50、分類篩選與即時搜尋
- 首三名重點研究，其餘保持高密度列表
- 每個 repo 顯示上榜原因、適合對象、證據、風險與分數拆解
- 每日 JSON 歷史、原始快照和 Markdown 日報
- 首日暖機，第二次快照開始使用真實 24 小時增長
- GitHub Actions 每日 08:17 香港時間自動更新及部署 Pages
- API 或驗證失敗時不會覆蓋上一份正常網站

## 本機使用

```bash
pnpm install
pnpm run daily
pnpm dev
```

公開資料可以不帶 token 執行，但額度較低。需要時把 GitHub token 放入 `GITHUB_TOKEN` 環境變數。不要把 token 寫進程式或提交到 Git。

無網絡時可以建立明確標示的示例榜：

```bash
pnpm run daily:fixtures
```

## 驗證

```bash
pnpm test
pnpm build
```

## 排名方法

有每日基線後，100 分由以下訊號組成：

- star 動能 35 分
- 按 repo 體量校正的相對增長 20 分
- 相比前六日的增長加速度 10 分
- fork 動能 10 分
- 最後 push 距今時間 15 分
- 項目年齡新鮮度 10 分

增長訊號的估算方式：

- 增量除以兩份快照的實際相隔時間，換算成每日速度；Actions 延遲或漏跑都不會令數字失真。
- 若 repo 不在昨日快照，會改用四日內最近一份包含它的快照。
- star 速度取 24 小時速度與三日平均各半，減少單日噪音。
- 在上一份快照之後才建立的 repo，所有 stars 都算作期間增長。
- 完全沒有基線的 repo 用候選池的中位數速度，不會被當成零增長而埋沒，亦不會無故上榜。
- 同分訊號共用平均百分位，不受 API 回傳次序影響。

首日沒有昨日數據，會以 stars/day、總 stars、項目年齡和最後 push 建立暖機排名。摘要文字不參與分數。

### 回測

```bash
pnpm backtest
```

用每日快照重播排名（只用當日已有的歷史），再對比之後 1、3、7 日實際的 star 增長（絕對增長 60%、體量校正增長 40%）。指標包括 Spearman 相關、Top 50 命中率和前後兩日 Top 50 重疊度。方法版本 1.1.0 以 2026-09-02 至 10-05 的 34 份快照回測，以未來 3 日為準：

| 版本 | Spearman | Top 50 命中率 | Top 50 穩定度 |
| --- | --- | --- | --- |
| 1.0.0 | 0.688 | 0.527 | 0.699 |
| 1.1.0 | 0.853 | 0.608 | 0.714 |

權重沒有按回測調整，避免以少量歷史過度擬合；只改進訊號的估算方式。

## 每日資料流

1. 九組搜尋分別探索新項目、活躍項目及主要技術分類。
2. 合併並去除重複、fork 和 archived repository。
3. 與最近八日快照比較，計算增長和排名變化。
4. 寫入 `public/data/current.json`、日期歷史、候選快照及 Markdown 日報。
5. 測試及建置全部通過後才提交資料並部署 Pages。

## GitHub Pages

把專案推到 GitHub 後，在 repository Settings 的 Pages 將來源設為 GitHub Actions。工作流亦可由 Actions 頁面手動執行。

若預設分支禁止 Actions bot 直接 push，請允許 `github-actions[bot]` 寫入資料，或把保存歷史步驟改為建立 pull request。
