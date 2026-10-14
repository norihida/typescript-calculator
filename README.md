## 起動方法

````bash
cd vite-calculator

npm run dev
開発・動作確認用
npm run build
完成後・提出用

npm run test
単体テスト
npm run test:ui
GUI でテスト

npm install

※ VS Codeで普通に開けます
※ 実務でも全員やります

git rm -r --cached node_modules
git commit -m "chore: node_modulesをGit管理から除外"
git push

解説：
git rm -r --cached は「自分のパソコンにあるファイルは残したまま、Git/GitHubの追跡だけをやめる」という非常に便利で安全なコマンドです。

---

### 方法② メモ帳・Notion・付箋
- 自分が見やすい場所でOK
- 「起動コマンド」とだけ書いておく

---

### 方法③ VS Codeの履歴を使う
ターミナルで：
- ↑（上キー） → 前のコマンドが出る
- Enter → 再実行

👉 **これが一番使われます**

---

## ちなみに `cd vite-project` について
### 毎回必要ではありません
- **すでに `vite-project` を開いていれば不要**
- VS Codeのターミナルは
  👉 **開いているフォルダが基準**

なので多くの場合👇だけでOKです。

```bash
npm run dev

````
