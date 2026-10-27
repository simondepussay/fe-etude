# 基本情報 Étude

Site d’étude quotidienne pour le **基本情報技術者試験** (Fundamental Information Technology Engineer Examination, IPA).

**En ligne : https://ashy-pebble-01d1fc600.5.azurestaticapps.net**

Trois profils au choix : **français**, **anglais** ou **日本語**. Le japonais est toujours affiché ; le reste de l’interface, les sens et les explications suivent le profil choisi.

## Modules

| Module | Contenu | État |
|---|---|---|
| 用語 | Terme japonais → sens en français / en anglais, ou **définition en japonais** pour le profil ja. Réparti selon les douze domaines du programme (基礎理論 → 企業と法務) | 273 termes |
| 科目A | Notion + formule + exemples résolus + pièges, et **les vraies questions de l’IPA** rattachées à la notion | 120 notions · 74 公開問題 sur 51 notions |
| 語彙 | Les mots pour **lire** l’épreuve : vocabulaire du 擬似言語, tournures des énoncés, japonais courant. Relevé par Simon au fil des cours et des tests blancs. Glosé en français, donc proposé au seul profil francophone | 818 mots, 6 catégories |
| 科目B | 16 points de méthode + 39 exercices, répartis en six catégories : プログラムの基本, データ構造, 探索と整列, 数値と文字列, オブジェクト指向, 情報セキュリティ. Chaque fiche porte son programme en 擬似言語, son explication, son déroulé pas à pas et son piège | 55 fiches, 110 QCM |

**アルゴ劇場** (`/algo/`) : le programme, les variables, le tableau, le トレース表 et les compteurs avancent ensemble, une étape à la fois. Mode 予想する (deviner avant chaque ligne), 空欄, QCM, en japonais ou en anglais. Personnages d’encouragement dessinés en SVG (originaux). Trois algorithmes pour commencer : 最大値, バブルソート, 二分探索.

Les modules s’activent et se désactivent dans *Réglages* et au premier lancement : on peut réviser le 科目A seul, le 科目B seul, ou tout.

## Comment ça marche

Chaque jour, une leçon est préparée automatiquement : **réviser** ce qui est dû (répétition espacée), **apprendre** les nouveaux éléments, puis **se tester**. Ce qui est raté revient à la fin de la leçon.

Le nombre de nouveaux éléments par jour se calcule à partir de la date d’examen, des jours d’étude par semaine et du temps maximum par jour. Le 基本情報技術者試験 étant passé en CBT, la date se choisit librement.

On peut utiliser le site sans compte (progression dans le navigateur) ou se connecter avec Google, Apple ou Microsoft. Aucun mot de passe n’est stocké.

## Contenu et droits

- Les **questions d’examens passés de l’IPA** sont réutilisables : l’IPA indique 「法令に特別の定めがある場合を除き許諾や使用料は必要ありません」.
- La notation du **擬似言語** est celle définie par l’IPA pour l’examen.
- Aucun contenu provenant d’un éditeur tiers ou d’un manuel d’école n’est inclus dans ce dépôt.

## Architecture

```
FE-Etude/
├── web/                     ← site statique (Azure Static Web Apps)
│   ├── index.html
│   ├── app/   core.js (planning, répétition espacée, synchro) · exercices.js · ui.js · compte.js · config.js · style.css
│   └── data/  fe-yougo*.js (用語) · fe-kamokua*.js (科目A) · fe-kamokub*.js (科目B)
├── api/                     ← Azure Functions (Node 20)
│   └── src/  functions/api.js · lib/auth.js · lib/store.js
└── .github/workflows/deploy.yml
```

Le moteur est repris de mon site d’étude JLPT : les clés internes `v` et `g` viennent de là (`v` = moteur « élément → sens », `g` = moteur « notion + QCM »).
