# 基本情報 Étude

Site d’étude quotidienne pour le **基本情報技術者試験** (Fundamental Information Technology Engineer Examination, IPA).

Trois profils au choix : **français**, **anglais** ou **日本語**. Le japonais est toujours affiché ; le reste de l’interface, les sens et les explications suivent le profil choisi.

## Modules

| Module | Contenu | État |
|---|---|---|
| 用語 | Terme japonais → sens en français / en anglais, ou **définition en japonais** pour le profil ja | 58 termes |
| 科目A | Notion + QCM de style examen, avec explication | à venir |
| 科目B | 擬似言語 : suivre un algorithme pas à pas | à venir |

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
│   └── data/  fe-yougo.js (termes + sens anglais) · fe-yougo-fr.js · fe-yougo-ja.js
├── api/                     ← Azure Functions (Node 20)
│   └── src/  functions/api.js · lib/auth.js · lib/store.js
└── .github/workflows/deploy.yml
```

Le moteur est repris de mon site d’étude JLPT : les clés internes `v` et `g` viennent de là (`v` = moteur « élément → sens », `g` = moteur « notion + QCM »).
