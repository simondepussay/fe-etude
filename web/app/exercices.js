/* 基本情報 Étude — génération des exercices (用語, 科目A). */
(function () {
  const J = window.J;
  const { esc, hl, blank, strip, shuffle, pick, shortMeaning } = J;

  /* ───────── Distracteurs de lecture « à la JLPT » ───────── */
  const DAK = "かがきぎくぐけげこごさざしじすずせぜそぞただちぢつづてでとどはばひびふぶへべほぼ";
  const dakMap = {};
  for (let i = 0; i < DAK.length; i += 2) { dakMap[DAK[i]] = DAK[i + 1]; dakMap[DAK[i + 1]] = DAK[i]; }
  const O_ROW = "こごそぞとどのほぼぽもよろょ";
  function mutations(r) {
    const out = new Set();
    for (let i = 0; i < r.length; i++) {
      const c = r[i];
      if (dakMap[c]) out.add(r.slice(0, i) + dakMap[c] + r.slice(i + 1));
      if (c === "う" && i > 0 && (O_ROW.includes(r[i - 1]) || r[i - 1] === "ゅ")) out.add(r.slice(0, i) + r.slice(i + 1));
      if ((O_ROW.includes(c) || c === "ゅ") && r[i + 1] !== "う" && i < r.length) out.add(r.slice(0, i + 1) + "う" + r.slice(i + 1));
      if (c === "っ") out.add(r.slice(0, i) + r.slice(i + 1));
      if ("かきくけこさしすせそたちつてとぱぴぷぺぽ".includes(c) && i > 0 && r[i - 1] !== "っ" && r[i - 1] !== "ん") out.add(r.slice(0, i) + "っ" + r.slice(i));
      if (c === "ゅ" || c === "ょ" || c === "ゃ") out.add(r.slice(0, i) + { "ゅ": "ゆ", "ょ": "よ", "ゃ": "や" }[c] + r.slice(i + 1));
    }
    out.delete(r);
    return [...out];
  }
  const vByLen = {};
  for (const v of J.items.v) (vByLen[v.r.length] = vByLen[v.r.length] || []).push(v);
  const realReadings = (w) => new Set(J.items.v.filter((x) => x.w === w).map((x) => x.r));

  function readingOptions(word, reading) {
    const bad = realReadings(word);
    const opts = new Set();
    for (const m of shuffle(mutations(reading))) { if (opts.size >= 2) break; if (!bad.has(m)) opts.add(m); }
    const pool = shuffle(vByLen[reading.length] || []);
    for (const x of pool) { if (opts.size >= 3) break; if (!bad.has(x.r) && x.r !== reading) opts.add(x.r); }
    return shuffle([reading, ...[...opts].slice(0, 3)]);
  }
  function otherItems(m, id, n, filter) {
    const pool = shuffle(J.items[m].filter((x) => x.id !== id && (!filter || filter(x))));
    return pool.slice(0, n);
  }
  function uniqueOptions(correct, list) {
    const s = new Set([correct]);
    for (const x of list) { if (s.size >= 4) break; s.add(x); }
    return shuffle([...s]);
  }

  const L = (fr, en, ja) => J.L(fr, en, ja);
  const M = (m, x) => J.mean(m, x);              // sens dans la langue choisie
  const SM = (m, x) => shortMeaning(J.mean(m, x));
  const trad = (jp) => { const t = J.trad(jp); return t ? `<p class="fr-trad">${esc(t)}</p>` : ""; };

  /* ───────── Fiches de réponse ───────── */
  J.vocabBack = (v) =>
    `<div class="ans-card"><div class="ans-word jp" lang="ja">${esc(v.w)}</div><div class="ans-read jp" lang="ja">${esc(v.r)}</div><div class="ans-mean">${esc(M("v", v))}</div>
     <button class="icon-btn" data-act="say" data-say="${esc(v.r)}" title="${L("Écouter", "Listen", "読み上げ")}">🔊</button></div>`;
  /* Affiche un programme en 擬似言語. Les blancs sont notés ［ a ］ dans le texte. */
  J.progBlock = (b) => !b.prog ? "" :
    `<pre class="prog jp" lang="ja">${b.prog.map((l) => esc(l)).join("\n")}</pre>`;
  /* Schéma facultatif (arbre, liste, pile) affiché avant le programme. */
  J.zuBlock = (b) => !b.zu ? "" :
    `<pre class="prog zu jp" lang="ja">${b.zu.map((l) => esc(l)).join("\n")}</pre>`;
  J.kamokubBack = (b) =>
    `<div class="ans-card b">${J.zuBlock(b)}${J.progBlock(b)}
      <div class="ans-mean">${esc(J.bs(b, "e"))}</div>
      ${b.t ? `<div class="piege"><b>${L("Piège", "Pitfall", "注意")}</b> ${esc(J.bs(b, "t"))}</div>` : ""}
      <button class="link" data-act="open-item" data-m="b" data-id="${b.id}">${L("Revoir le problème", "Review the problem", "問題を見直す")} →</button></div>`;

  J.gramBack = (g, extra = "") =>
    `<div class="ans-card left"><div class="ans-pattern jp" lang="ja">${esc(g.p)}</div><div class="ans-mean">${esc(J.gs(g, "s"))}</div>
      <div class="ans-form jp" lang="ja">${esc(g.f)}</div>${extra}
      <button class="link" data-act="open-item" data-m="g" data-id="${g.id}">${L("Revoir la leçon", "Review the lesson", "解説に戻る")} →</button></div>`;
  const exLine = (g, i) => `<div class="sentence small jp" lang="ja">${hl(g.ex[i][0])}</div><p class="fr-trad">${esc(J.gex(g, i))}</p>`;

  /* ───────── Types d’exercices par module et par étape ───────── */
  const KINDS = {
    v: { rev: ["v-read", "v-mean", "v-word", "v-flash", "v-read"], check: ["v-mean", "v-read"], test: ["v-read", "v-word"] },
    g: { rev: ["g-qcm", "g-cloze", "g-ord", "g-flash", "g-qcm"], check: ["g-qcm", "g-cloze"], test: ["g-qcm", "g-ord", "g-qcm"] },
    b: { rev: ["b-qcm", "b-flash", "b-qcm"], check: ["b-qcm"], test: ["b-qcm"] }
  };
  const LABELS = {
    "v-read": ["読み方", "Lecture", "Reading"], "v-mean": ["意味", "Sens", "Meaning"], "v-word": ["語彙", "Quel mot ?", "Which word?"], "v-flash": ["カード", "Rappel", "Recall"],
    "g-qcm": ["知識問題", "Connaissances", "Knowledge"], "g-cloze": ["穴埋め", "Énoncé à trous", "Fill the gap"], "g-ord": ["順序の並べ替え", "Étapes à ordonner ★", "Steps in order ★"], "g-flash": ["カード", "Rappel", "Recall"],
    "b-qcm": ["科目B", "Trace du programme", "Program trace"], "b-flash": ["カード", "Rappel", "Recall"]
  };
  J.kindLabel = (k) => (J.lang() === "ja" ? LABELS[k][0] : `${LABELS[k][0]} · ${L(LABELS[k][1], LABELS[k][2])}`);

  function usable(m, id, kind) {
    const x = J.byId[m][id];
    // la lecture d’un 用語 n’apprend rien à un locuteur natif
    if (kind === "v-read") return J.lang() !== "ja" && x.w !== x.r && /[一-龯]/.test(x.w);
    if (kind === "g-ord") return !!x.o;
    if (kind === "g-cloze") return x.ex && x.ex.length;
    if (kind === "b-qcm") return x.q && x.q.length;
    return true;
  }

  J.makeEx = function (m, id, stage = "rev", kind) {
    if (!J.byId[m][id]) throw new Error("Élément introuvable : " + id);
    let k = kind;
    if (!k || !usable(m, id, k)) {
      const list = KINDS[m][stage].filter((kk) => usable(m, id, kk));
      k = pick(list.length ? list : KINDS[m].rev.filter((kk) => usable(m, id, kk)));
    }
    const ex = BUILD[k](J.byId[m][id]);
    return { m, id, kind: k, stage, label: J.kindLabel(k), answered: false, revealed: false, t0: Date.now(), ...ex };
  };

  const BUILD = {
    /* Vocabulaire */
    "v-read": (v) => ({
      mode: "choice",
      prompt: `<p class="q-help">${L("Choisis la bonne lecture.", "Choose the correct reading.", "正しい読みを選びなさい。")}</p><div class="big-jp jp" lang="ja">${esc(v.w)}</div>`,
      options: readingOptions(v.w, v.r), answer: v.r, back: J.vocabBack(v), say: v.r, jpOpts: true
    }),
    "v-mean": (v) => {
      const opts = uniqueOptions(SM("v", v), otherItems("v", v.id, 8).map((x) => SM("v", x)));
      return { mode: "choice", prompt: `<p class="q-help">${L("Que signifie ce mot ?", "What does this word mean?", "この用語の意味はどれか。")}</p><div class="big-jp jp" lang="ja">${esc(v.w)}</div>`,
        options: opts, answer: SM("v", v), back: J.vocabBack(v), say: v.r };
    },
    "v-word": (v) => {
      const sameLen = otherItems("v", v.id, 12, (x) => x.w.length === v.w.length && x.w !== v.w);
      const opts = uniqueOptions(v.w, sameLen.map((x) => x.w).concat(otherItems("v", v.id, 6).map((x) => x.w)));
      return { mode: "choice", prompt: `<p class="q-help">${L("Quel mot correspond à ce sens ?", "Which word matches this meaning?", "この説明に当てはまる用語はどれか。")}</p><div class="big-fr">${esc(SM("v", v))}</div>`,
        options: opts, answer: v.w, back: J.vocabBack(v), say: v.r, jpOpts: true };
    },
    "v-flash": (v) => ({
      mode: "self", prompt: `<p class="q-help">${L("Lis le mot dans ta tête, donne son sens, puis vérifie.", "Read the word in your head, give its meaning, then check.", "用語を読み、意味を思い浮かべてから確かめる。")}</p><div class="big-jp jp" lang="ja">${esc(v.w)}</div>`,
      back: J.vocabBack(v), say: v.r
    }),
    /* 科目A */
    "g-qcm": (g) => {
      const [q, c] = pick(g.q);
      const filled = q.includes("＿＿＿") ? q.replace("＿＿＿", c[0]) : "";
      const full = filled ? esc(q).replace("＿＿＿", `<mark>${esc(c[0])}</mark>`) : "";
      return { mode: "choice", prompt: `<p class="q-help">（　）に入る最もよいものを選びなさい。</p><div class="sentence jp" lang="ja">${esc(q).replace("＿＿＿", '<span class="blank">（　　　）</span>')}</div>`,
        options: shuffle(c), answer: c[0], back: J.gramBack(g, full ? `<div class="sentence small jp" lang="ja">${full}</div>${trad(filled)}` : ""), say: filled, jpOpts: true };
    },
    "g-cloze": (g) => {
      const i = Math.floor(Math.random() * g.ex.length);
      return { mode: "self", prompt: `<p class="q-help">${L("Quel est le terme manquant ? Dis-le à voix haute, puis vérifie.", "Which term is missing? Say it out loud, then check.", "空欄に入る語は何か。声に出してから確かめる。")}</p>
        <div class="sentence jp" lang="ja">${blank(g.ex[i][0])}</div><p class="fr-trad">${esc(J.gex(g, i))}</p>`,
        back: J.gramBack(g, `<div class="sentence small jp" lang="ja">${hl(g.ex[i][0])}</div>`), say: strip(g.ex[i][0]) };
    },
    "g-ord": (g) => {
      const [pre, pcs, post, star] = g.o;
      const full = pre + pcs.join("") + post;
      return { mode: "order", pre, post, pieces: pcs, star, order: shuffle([0, 1, 2, 3]), picks: [],
        prompt: `<p class="q-help">正しい順序に並べ替え、★ の位置に入るものを答えなさい。</p>`,
        back: J.gramBack(g, `<div class="sentence small jp" lang="ja">${esc(pre)}${pcs.map((p, i) => (i === star ? `<mark>${esc(p)}</mark>` : esc(p))).join("")}${esc(post)}</div>${trad(full)}`), say: full };
    },
    /* 科目B */
    "b-qcm": (b) => {
      const i = Math.floor(Math.random() * b.q.length);
      const opts = b.q[i][1];
      return {
        mode: "choice",
        prompt: `<p class="q-help">${esc(J.bs(b, "s"))}</p>${J.zuBlock(b)}${J.progBlock(b)}<p class="q-enonce">${esc(J.bq(b, i))}</p>`,
        options: uniqueOptions(opts[0], opts.slice(1)), answer: opts[0], back: J.kamokubBack(b)
      };
    },
    "b-flash": (b) => ({
      mode: "self",
      prompt: `<p class="q-help">${L("Que fait ce programme ?", "What does this program do?", "このプログラムは何をするか")}</p>${J.progBlock(b)}`,
      back: J.kamokubBack(b)
    }),

    "g-flash": (g) => ({
      mode: "self", prompt: `<p class="q-help">${L("Donne la définition et le point clé, puis vérifie.", "Give the definition and the key point, then check.", "内容と要点を思い出してから確かめる。")}</p><div class="big-jp jp" lang="ja">${esc(g.p)}</div>`,
      back: J.gramBack(g, exLine(g, 0)), say: g.ex[0][0]
    })
  };

  /* ───────── Fiches d’apprentissage ───────── */
  J.learnCard = function (m, id) {
    const x = J.byId[m][id];
    if (m === "v") {
      return `<div class="learn v">
        <div class="learn-head"><div class="big-jp jp" lang="ja">${esc(x.w)}</div><div class="ans-read jp" lang="ja">${esc(x.r)}</div>
        <button class="icon-btn" data-act="say" data-say="${esc(x.r)}" title="${L("Écouter", "Listen", "読み上げ")}">🔊</button></div>
        <div class="learn-mean">${esc(M("v", x))}</div>
      </div>`;
    }
    if (m === "b") return J.kamokubLesson(x);
    return J.grammarLesson(x, true);
  };

  /* Intitulé d’une section : le terme japonais, et sa traduction sauf sur le profil ja,
     où elle ferait doublon. Les mêmes intitulés pour le 科目A et le 科目B. */
  const boite = (jp, fr, en) => `<h4>${jp}${J.lang() === "ja" ? "" : ` · ${L(fr, en)}`}</h4>`;

  J.grammarLesson = function (g, compact) {
    const cat = J.gcats.find((c) => c.id === g.cat);
    const piege = J.gs(g, "t");
    return `<article class="glesson">
      <div class="g-top"><span class="pill">${g.n} · ${esc(cat ? cat.jp : "")}</span><span class="muted">${esc(cat ? J.gcat(cat) : "")}</span></div>
      <h2 class="g-pattern jp" lang="ja">${esc(g.p)}</h2>${g.y ? `<div class="muted jp" lang="ja">${esc(g.y)}</div>` : ""}
      <p class="g-sens">${esc(J.gs(g, "s"))}</p>
      <div class="g-box">${boite("要点", "Formule, méthode", "Formula, method")}<div class="jp" lang="ja">${esc(g.f)}</div></div>
      <div class="g-box">${boite("解説", "Explication", "Explanation")}<p>${esc(J.gs(g, "e"))}</p></div>
      <div class="g-box">${boite("例", "Exemples", "Examples")}${g.ex.map(([jp], i) => `<div class="exline">
        <button class="icon-btn sm" data-act="say" data-say="${esc(strip(jp))}" title="${L("Écouter", "Listen", "読み上げ")}">🔊</button>
        <div><div class="jp" lang="ja">${hl(jp)}</div><div class="fr-trad">${esc(J.gex(g, i))}</div></div></div>`).join("")}</div>
      ${piege ? `<div class="g-box warn">${boite("⚠︎ 注意", "Piège", "Watch out")}<p>${esc(piege)}</p></div>` : ""}
      ${compact ? "" : `<div class="g-box">${boite("メモ", "Mes notes", "My notes")}
        <textarea id="notes" data-key="g:${g.id}" rows="4" placeholder="${L("Refais le calcul ou réécris la règle avec tes mots : c’est le meilleur moyen de la retenir.", "Redo the calculation or restate the rule in your own words: that is the best way to remember it.", "計算をやり直すか、自分の言葉で書き直しておく。覚えるにはこれが一番速い。")}">${esc(J.S.notes["g:" + g.id] || "")}</textarea></div>`}
    </article>`;
  };

  /* Fiche d’un problème de 科目B : le programme, ce qu’il fait, la trace, les pièges. */
  J.kamokubLesson = function (b) {
    const cat = J.bcats.find((c) => c.id === b.cat);
    const piege = J.bs(b, "t");
    return `<article class="glesson">
      <div class="g-top"><span class="pill">${b.n} · ${esc(cat ? cat.jp : "")}</span><span class="muted">${esc(cat ? J.bcat(cat) : "")}</span></div>
      <h2 class="g-pattern jp" lang="ja">${esc(b.p)}</h2>${b.y ? `<div class="muted jp" lang="ja">${esc(b.y)}</div>` : ""}
      <p class="g-sens">${esc(J.bs(b, "s"))}</p>
      ${b.zu ? `<div class="g-box">${boite("図", "Schéma", "Diagram")}${J.zuBlock(b)}</div>` : ""}
      ${b.prog ? `<div class="g-box">${boite("擬似言語", "Programme", "Program")}${J.progBlock(b)}</div>` : ""}
      <div class="g-box">${boite("解説", "Explication", "Explanation")}<p>${esc(J.bs(b, "e"))}</p></div>
      ${b.trace ? `<div class="g-box">${boite("トレース", "Déroulé pas à pas", "Step by step")}
        <table class="trace"><thead><tr>${b.trace[0].map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
        <tbody>${b.trace.slice(1).map((r) => `<tr>${r.map((c) => `<td class="jp">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
      ${piege ? `<div class="g-box warn">${boite("⚠︎ 注意", "Piège", "Watch out")}<p>${esc(piege)}</p></div>` : ""}
      <div class="g-box">${boite("メモ", "Mes notes", "My notes")}
        <textarea id="notes" data-key="b:${b.id}" rows="4" placeholder="${L("Note ici ce qui t’a bloqué dans ce programme.", "Note here what tripped you up in this program.", "つまずいた点を書いておく。")}">${esc(J.S.notes["b:" + b.id] || "")}</textarea></div>
    </article>`;
  };
})();
