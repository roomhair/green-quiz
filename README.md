# green-quiz — 観葉植物クイズ

写真を見て観葉植物の名前を5つの選択肢から当てるクイズです。全10問。
**全問正解するとマニアックなファイナル問題1問**に挑戦できます。

```
open index.html          # ビルド不要。ブラウザで開くだけ
```

## 内容

| | |
|---|---|
| 出題 | 19種の観葉植物からランダムに10問（毎回変わります） |
| 選択肢 | 5択。「間違えやすい植物」を優先してダミーに使用 |
| 解説 | 回答するたびに学名・特徴を表示 |
| ファイナル問題 | 10/10で解放。亀甲竜・ユーフォルビア オベサ・アガベ チタノタから1問 |
| 操作 | クリック / タップのほか、キーボードの `1`〜`5`、`Enter` で次へ |
| 記録 | ベストスコアと称号を localStorage に保存 |

## 写真について

写真は [Wikimedia Commons](https://commons.wikimedia.org/) から
`Special:FilePath` 経由で読み込んでいます。各写真のクレジット（ファイルページへの
リンク）は、答えが分かってしまわないよう**回答した直後に表示**されます。
ライセンスと著作者は各ファイルページに記載されています。再配布・公開時は
利用するライセンス（CC BY / CC BY-SA など）の条件を確認してください。

写真が読み込めない環境（オフライン等）では、`js/art.js` に内蔵した
**SVGイラストへ自動的にフォールバック**します。

### 写真を差し替える

- **別の Commons 写真にする**: `js/plants.js` の `file` をファイル名に変更
  （例 `file: 'Monstera_deliciosa_A.jpg'`）
- **手元の写真を使う**: `images/` に画像を置き、`photo` にパスを指定
  （例 `photo: 'images/monstera.jpg'`）。`photo` は `file` より優先されます

## ファイル構成

```
index.html        画面の骨組み
css/style.css     スタイル（ライト／ダークテーマ対応）
js/plants.js      出題データ（植物19種＋ファイナル3問）
js/art.js         写真が無いときのイラスト（インラインSVG）
js/app.js         出題・採点・画面遷移
images/           ローカル写真を置く場所（任意）
```

## 植物を追加する

`js/plants.js` の `PLANTS` に1件足すだけで出題対象に加わります。

```js
{
  id: 'spathiphyllum',
  name: 'スパティフィラム',
  latin: 'Spathiphyllum wallisii',
  file: 'Spathiphyllum_cochlearispathum_RTBG.jpg',   // Commons のファイル名
  photo: null,                                       // ローカル写真を使うならパス
  tint: '#eaf2e5',                                   // イラスト背景の色
  fact: '白い仏炎苞が特徴の……',
  near: ['calathea', 'pothos'],                      // 間違えやすい植物の id
}
```
