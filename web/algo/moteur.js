/* アルゴ劇場 — le moteur.
   1. enregistrer() exécute l'algorithme une fois et garde une image de chaque étape
      (ligne, variables, tableau, compteurs) ;
   2. maj() dessine l'image courante : l'utilisateur avance ou recule d'une étape à la fois.
   Interface en japonais ou en anglais (bouton 日本語 / EN). */
(() => {
"use strict";

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const melange = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const lire = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const CLE = "fe-algo-v1";

/* ———————————— langue ———————————— */
function langueInitiale() {
  const l = lire(CLE + "-lang", null);
  if (l === "ja" || l === "en") return l;
  try { /* le profil choisi sur 基本情報 Étude */
    for (let k = 0; k < localStorage.length; k++) {
      const key = localStorage.key(k);
      if (!key.startsWith("jlpt-etude-")) continue;
      const p = JSON.parse(localStorage.getItem(key));
      if (p && p.settings && (p.settings.lang === "ja" || p.settings.lang === "en")) return p.settings.lang;
    }
  } catch {}
  return (navigator.language || "").startsWith("en") ? "en" : "ja";
}
let LANG = langueInitiale();
const L = (ja, en) => (LANG === "ja" ? ja : en);
const ico = n => `<svg class="ico"><use href="#i-${n}"/></svg>`;

const UI = {
  ja: {
    voir: ico("oeil") + "見る", deviner: ico("pense") + "予想する", donnees: ico("de") + "データ", exos: ico("crayon") + "練習",
    "t-code": '<span class="jp">擬似言語</span>', "t-vars": '<span class="jp">変数</span>', "t-arr": '<span class="jp">配列</span> a',
    "t-trace": '<span class="jp">トレース表</span>', "t-cpt": '<span class="jp">回数</span>',
    aide: "<kbd>→</kbd> <kbd>Space</kbd> 進む · <kbd>←</kbd> 戻る",
    retour: "基本情報 Étude に戻る", debut: "最初から", arriere: "前のステップ (←)",
    "o-blancs": '<span class="jp">空欄</span> · コードを完成させる', "o-qcm": '<span class="jp">確認</span> · 確認問題'
  },
  en: {
    voir: ico("oeil") + "Watch", deviner: ico("pense") + "Predict", donnees: ico("de") + "Data", exos: ico("crayon") + "Practice",
    "t-code": '<span class="jp">擬似言語</span> · program', "t-vars": '<span class="jp">変数</span> · variables', "t-arr": '<span class="jp">配列</span> · array a',
    "t-trace": '<span class="jp">トレース表</span> · trace table', "t-cpt": '<span class="jp">回数</span> · cost',
    aide: "<kbd>→</kbd> <kbd>Space</kbd> next · <kbd>←</kbd> back",
    retour: "Back to 基本情報 Étude", debut: "Restart", arriere: "Previous step (←)",
    "o-blancs": '<span class="jp">空欄</span> · fill the blank', "o-qcm": '<span class="jp">確認</span> · quiz'
  }
};
const CPT = { cmp: [["比較", "comparisons"], "var(--kin)"], swap: [["交換", "swaps"], "var(--sakura)"], aff: [["代入", "assignments"], "var(--ai)"] };

function appliquerTextes() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-t]").forEach(e => { e.innerHTML = UI[LANG][e.dataset.t]; });
  document.querySelectorAll("[data-t-title]").forEach(e => { e.title = UI[LANG][e.dataset.tTitle]; });
  document.querySelectorAll("#langues .mode").forEach(b => b.classList.toggle("actif", b.dataset.lang === LANG));
}

const S = {
  algo: null, donnees: null, steps: [], cur: 0,
  mode: "voir", repondu: new Map(), attente: null, retour: null, serie: 0,
  onglet: "blancs", maxVal: 1
};

/* ———————————— enregistrement ———————————— */
function enregistrer(algo, donnees) {
  const steps = [], v = {}, arr = donnees.a.slice(), c = { cmp: 0, swap: 0, aff: 0 }, fixe = [];
  let prev = {};
  const a = i => arr[i - 1];
  const T = {
    v, c, x: donnees.x, L,
    get n() { return arr.length; },
    a, arr: () => arr.slice(),
    set(i, val) { arr[i - 1] = val; c.aff++; },
    fixer(i) { if (!fixe.includes(i)) fixe.push(i); },
    liste: () => arr.join(", "),
    /* bonne réponse + jusqu'à 3 distracteurs tirés de pool (+ voisins si besoin) */
    choix(bon, pool) {
      const s = new Set([String(bon)]);
      for (const p of melange(pool.concat([bon + 1, bon - 1, bon + 2]))) {
        if (s.size >= 4) break;
        if (p !== undefined && p !== null && !Number.isNaN(p)) s.add(String(p));
      }
      const r = melange([...s]); r.bon = String(bon); return r;
    },
    step(line, msg, o = {}) {
      if (steps.length > 3000) throw new Error(L("ステップが多すぎます（無限ループ？）", "Too many steps: infinite loop?"));
      const vs = { ...v };
      const changed = Object.keys(vs).filter(k => vs[k] !== prev[k] && vs[k] !== undefined);
      prev = vs;
      const q = o.q ? { texte: o.q.texte, choix: o.q.choix.map(String), bon: String(o.q.bon ?? o.q.choix.bon) } : null;
      steps.push({
        line, msg, v: vs, arr: arr.slice(), c: { ...c }, fixe: fixe.slice(), changed,
        look: o.look || [], cmp: o.cmp || [], ecrit: o.ecrit || [], trouve: o.trouve || [],
        live: algo.ligne(vs, a, arr.slice(), o, L).map(x => (x === undefined ? "—" : String(x))),
        row: !!o.row,
        q, fin: !!o.fin
      });
    }
  };
  algo.run(T);
  return steps;
}

/* ———————————— mise en couleur du 擬似言語 ———————————— */
function colorer(txt) {
  return esc(txt)
    .replace(/\b(endfor|endif|endwhile|elseif|else|for|if|while|return)\b/g, '<span class="k">$1</span>')
    .replace(/(整数型|実数型|文字列型|論理型)(の配列)?/g, '<span class="t">$&</span>')
    .replace(/(を|から|まで|ずつ増やす|ずつ減らす|の要素数|の商)/g, '<span class="k">$1</span>')
    .replace(/(←|○)/g, '<span class="fl">$1</span>');
}

/* ———————————— construction ———————————— */
function construireChoix() {
  const scores = lire(CLE, {});
  $("#choix").innerHTML = ALGOS.map(al => {
    const s = scores[al.id];
    const et = s === undefined ? "" : `<span class="etoiles">${ico("etoile").repeat(s >= .9 ? 3 : s >= .7 ? 2 : 1)}</span>`;
    return `<button class="chip${al === S.algo ? " actif" : ""}" data-id="${al.id}" title="${esc(al.en)}"><span class="cat">${al.cat}</span><span class="jp">${esc(al.jp)}</span>${et}</button>`;
  }).join("");
}

function construireIntro() {
  const al = S.algo;
  $("#intro").innerHTML = `<span class="fr">${LANG === "en" ? esc(al.en) + " — " : ""}${esc(al.resume[LANG])}</span><b>${L("ポイント", "Key point")}</b>${esc(al.cle[LANG])}`;
}

function construireCode() {
  $("#code").innerHTML = S.algo.prog.map((l, i) =>
    `<li data-l="${i + 1}"><span class="num">${i + 1}</span><span class="fleche">▶</span><span class="txt">${colorer(l)}</span><span class="fois"></span></li>`).join("");
}

function construireVars() {
  $("#vars").innerHTML = S.algo.vars.map(n =>
    `<div class="boite" data-v="${n}"><span class="nom">${esc(n)}</span><span class="val"></span><span class="avant"></span></div>`).join("");
}

function construireStage() {
  const n = S.donnees.a.length;
  const slot = (i, fantome) => `<div class="slot${fantome ? " fantome" : ""}" data-i="${i}">
      <div class="colonne"><span class="v"></span><div class="bar"></div></div>
      <span class="idx">${i}</span><div class="drapeaux"></div></div>`;
  let h = slot(0, true);
  for (let i = 1; i <= n; i++) h += slot(i, false);
  h += slot(n + 1, true);
  $("#stage").innerHTML = h;
  S.maxVal = Math.max(1, ...S.steps.flatMap(s => s.arr));
  $("#cible").textContent = S.donnees.x !== undefined ? L(`x = ${S.donnees.x} を探す`, `looking for x = ${S.donnees.x}`) : "";
}

function construireDonnees() {
  const d = S.donnees, al = S.algo;
  $("#donnees").innerHTML = `<div class="form-d">
      <label for="d-a">a =</label><input id="d-a" class="a" value="${esc(d.a.join(", "))}" inputmode="numeric">
      ${d.x !== undefined ? `<label for="d-x">x =</label><input id="d-x" class="x" value="${esc(d.x)}" inputmode="numeric">` : ""}
      <button class="petit plein" id="d-ok">${L("適用", "Apply")}</button>
      <button class="petit" id="d-hasard">${ico("de")}${L("ランダム", "Random")}</button>
      <button class="petit" id="d-defaut">${L("例に戻す", "Example")}</button>
    </div>
    <p class="erreur" id="d-err"></p>
    <p class="muted small">${al.trie ? L("二分探索は整列済みの配列でしか使えないので、自動で整列します。", "Binary search only works on a sorted array, so it is sorted automatically. ") : ""}${L("0〜99 の整数を 2〜10 個。", "2 to 10 integers between 0 and 99.")}</p>`;
  $("#d-ok").addEventListener("click", appliquerDonnees);
  $("#d-a").addEventListener("keydown", e => { if (e.key === "Enter") appliquerDonnees(); });
  $("#d-x")?.addEventListener("keydown", e => { if (e.key === "Enter") appliquerDonnees(); });
  $("#d-defaut").addEventListener("click", () => { charger(al, al.donnees); fermer(); });
  $("#d-hasard").addEventListener("click", () => {
    const n = 5 + Math.floor(Math.random() * 4);
    let a = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 60));
    if (al.trie) a = [...new Set(a)].sort((p, q) => p - q);
    const nd = { a };
    if (al.donnees.x !== undefined) nd.x = Math.random() < .7 ? a[Math.floor(Math.random() * a.length)] : 1 + Math.floor(Math.random() * 60);
    charger(al, nd); fermer();
  });
}

function appliquerDonnees() {
  const err = $("#d-err");
  const a = $("#d-a").value.split(/[\s,、，]+/).filter(Boolean).map(Number);
  if (a.length < 2 || a.length > 10 || a.some(x => !Number.isInteger(x) || x < 0 || x > 99)) {
    err.textContent = L("0〜99 の整数を 2〜10 個、カンマで区切って入力してください。", "Enter 2 to 10 integers between 0 and 99, separated by commas.");
    return;
  }
  const nd = { a: S.algo.trie ? a.sort((p, q) => p - q) : a };
  if (S.donnees.x !== undefined) {
    const x = Number($("#d-x").value);
    if (!Number.isInteger(x)) { err.textContent = L("x は整数にしてください。", "x must be an integer."); return; }
    nd.x = x;
  }
  charger(S.algo, nd); fermer();
}

/* un exercice (空欄 ou 確認) : réponses, correction, confettis ou amie */
function brancherExo(ex, bon, expl) {
  ex.querySelectorAll(".rep").forEach(btn => btn.addEventListener("click", () => {
    const ok = btn.dataset.c === bon;
    ex.querySelectorAll(".rep").forEach(x => { x.disabled = true; if (x.dataset.c === bon) x.classList.add("bon"); });
    if (!ok) btn.classList.add("faux");
    const trou = ex.querySelector(".trou");
    if (trou) { trou.textContent = bon; trou.classList.add("rempli"); }
    const e = ex.querySelector(".expl"); e.hidden = false;
    e.innerHTML = `<b class="${ok ? "good" : "bad"}">${ok ? L("正解！", "Correct! ") : L("おしい。", "Not quite. ")}</b>${esc(expl)}`;
    humeur(ok ? "joie" : "oups");
    if (ok) FETE.confettis(btn, 40); else FETE.amie("erreur", LANG);
  }));
}

function construireBlancs() {
  const al = S.algo;
  $("#o-blancs").innerHTML = `<p class="consigne">${L("科目B と同じく、プログラムの一部が隠れています。【 a 】に入るのはどれ？", "Just like 科目B: part of the program is hidden. What goes into 【 a 】?")}</p>` +
    al.blancs.map((b, k) => `<div class="exo" data-k="${k}">
      <h4>${L(`空欄 ${k + 1} · ${b.ligne}行目`, `Blank ${k + 1} · line ${b.ligne}`)}</h4>
      <ol class="code">${al.prog.map((l, i) => {
        const html = i + 1 === b.ligne ? colorer(l.replace(b.trou, "\u0001")).replace("\u0001", '<span class="trou">a</span>') : colorer(l);
        return `<li><span class="num">${i + 1}</span><span></span><span class="txt">${html}</span></li>`;
      }).join("")}</ol>
      <div class="reps">${melange(b.choix).map(c => `<button class="rep" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div class="expl" hidden></div></div>`).join("");
  $("#o-blancs").querySelectorAll(".exo").forEach(ex => { const b = al.blancs[ex.dataset.k]; brancherExo(ex, b.choix[0], b.expl[LANG]); });
}

function construireQcm() {
  $("#o-qcm").innerHTML = S.algo.qcm.map((q, k) => { const [enonce, ch] = q[LANG]; return `<div class="exo" data-k="${k}">
      <h4>${esc(enonce)}</h4>
      <div class="reps">${melange(ch).map(c => `<button class="rep" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div class="expl" hidden></div></div>`; }).join("");
  $("#o-qcm").querySelectorAll(".exo").forEach(ex => { const [, ch, expl] = S.algo.qcm[ex.dataset.k][LANG]; brancherExo(ex, ch[0], expl); });
}

/* ———————————— dessin de l'étape courante ———————————— */
function maj() {
  const st = S.steps[S.cur];
  const prevSt = S.steps[S.cur - 1];
  majCode(st);
  majVars(st, prevSt);
  majStage(st, prevSt);
  majCompteurs();
  majBulle(st);
  majTrace();
  $("#prog").style.width = `${(S.cur + 1) / S.steps.length * 100}%`;
  $("#etape").textContent = L(`ステップ ${S.cur + 1} / ${S.steps.length}`, `step ${S.cur + 1} / ${S.steps.length}`);
  const b = $("#b-avant");
  b.disabled = S.attente !== null && !S.retour;
  b.innerHTML = S.attente !== null ? (S.retour ? L("この行を実行", "Run the line") + ico("play") : ico("pense") + L("先に答えてね", "Answer first"))
    : S.cur >= S.steps.length - 1 ? ico("encore") + L("もう一度", "Restart") : L("次へ", "Next step") + ico("play");
  $("#b-arriere").disabled = S.cur === 0 && S.attente === null;
}

function majCode(st) {
  const fois = {};
  for (let k = 0; k <= S.cur; k++) fois[S.steps[k].line] = (fois[S.steps[k].line] || 0) + 1;
  const max = Math.max(...Object.values(fois));
  const prochain = S.attente !== null ? S.steps[S.attente].line : null;
  document.querySelectorAll("#code li").forEach(li => {
    const l = +li.dataset.l, f = fois[l] || 0;
    li.classList.toggle("cur", l === st.line && prochain === null);
    li.classList.toggle("prochain", l === prochain);
    li.classList.toggle("vu", f > 0);
    li.style.setProperty("--chaleur", (f / max * .9).toFixed(2));
    li.querySelector(".fois").textContent = f ? `×${f}` : "";
  });
  const cur = document.querySelector("#code li.cur, #code li.prochain");
  if (cur && window.matchMedia("(min-width: 761px)").matches) cur.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function majVars(st, prevSt) {
  document.querySelectorAll("#vars .boite").forEach(b => {
    const n = b.dataset.v, val = st.v[n];
    const span = b.querySelector(".val");
    const nouveau = val === undefined ? "—" : String(val);
    const change = st.changed.includes(n) && S.attente === null;
    if (span.textContent !== nouveau || change) {
      span.textContent = nouveau;
      span.classList.toggle("vide", val === undefined);
      b.classList.remove("change"); void b.offsetWidth; /* relance l'animation */
    }
    b.classList.toggle("change", change);
    const avant = prevSt ? prevSt.v[n] : undefined;
    b.querySelector(".avant").textContent = change && avant !== undefined ? String(avant) : "";
  });
}

function majStage(st, prevSt) {
  const n = st.arr.length, al = S.algo;
  const zone = al.zone ? al.zone(st.v) : null;
  document.querySelectorAll("#stage .slot").forEach(sl => {
    const i = +sl.dataset.i;
    const flags = Object.entries(al.pointeurs).filter(([nom]) => st.v[nom] === i);
    sl.querySelector(".drapeaux").innerHTML = flags.map(([nom, coul]) =>
      `<span class="drapeau" style="background:${coul};border-bottom-color:${coul}">${esc(nom)}</span>`).join("");
    if (i === 0 || i === n + 1) { sl.classList.toggle("actif", flags.length > 0); return; }
    const val = st.arr[i - 1];
    sl.querySelector(".v").textContent = val;
    sl.querySelector(".bar").style.height = `${8 + 92 * val / S.maxVal}%`;
    const changeIci = prevSt && prevSt.arr[i - 1] !== val;
    sl.classList.toggle("regarde", st.look.includes(i));
    sl.classList.toggle("compare", st.cmp.includes(i));
    sl.classList.toggle("ecrit", st.ecrit.includes(i) || !!changeIci);
    sl.classList.toggle("fixe", st.fixe.includes(i));
    sl.classList.toggle("trouve", st.trouve.includes(i));
    sl.classList.toggle("hors", !!zone && (i < zone[0] || i > zone[1]));
  });
}

function majCompteurs() {
  const al = S.algo, st = S.steps[S.cur], fin = S.steps[S.steps.length - 1];
  const lignes = al.compteurs.map(k => {
    const [noms, coul] = CPT[k];
    const pct = fin.c[k] ? st.c[k] / fin.c[k] * 100 : 0;
    return `<div class="cpt"><span>${L(noms[0], noms[1])}</span><b>${st.c[k]}</b><span class="jauge"><i style="width:${pct}%;background:${coul}"></i></span></div>`;
  }).join("");
  /* courbe : comparaisons cumulées au fil des étapes */
  const W = 300, H = 40, N = Math.max(1, S.steps.length - 1), M = Math.max(1, fin.c.cmp);
  const pt = k => `${(k / N * W).toFixed(1)},${(H - 3 - S.steps[k].c.cmp / M * (H - 6)).toFixed(1)}`;
  const tout = S.steps.map((_, k) => pt(k)).join(" ");
  const fait = S.steps.slice(0, S.cur + 1).map((_, k) => pt(k)).join(" ");
  const [cx, cy] = pt(S.cur).split(",");
  $("#compteurs").innerHTML = lignes +
    `<svg class="courbe" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
       <polyline class="tout" points="${tout}"/><polyline class="fait" points="${fait}"/><circle cx="${cx}" cy="${cy}" r="3.5"/></svg>`;
}

function score() {
  const bons = [...S.repondu.values()].filter(Boolean).length;
  return { bons, tot: S.repondu.size, r: S.repondu.size ? bons / S.repondu.size : 0 };
}

function majBulle(st) {
  const b = $("#bulle");
  const no = n => `<span class="ligne-no">${L(`${n}行目`, `line ${n}`)}</span>`;
  if (S.attente !== null) {
    const q = S.steps[S.attente].q, r = S.retour;
    b.innerHTML = `<span class="q">${no(S.steps[S.attente].line)}${esc(q.texte)}</span>
      <div class="reps">${q.choix.map(c => {
        const cls = r ? (c === q.bon ? " bon" : c === r.choisi ? " faux" : "") : "";
        return `<button class="rep${cls}" data-c="${esc(c)}"${r ? " disabled" : ""}>${esc(c)}</button>`;
      }).join("")}</div>
      ${r ? `<div class="verdict ${r.ok ? "ok" : "ko"}">${r.ok ? L("正解！よく見えてるね。", "Correct! Well spotted.") : L(`残念、正解は「${esc(q.bon)}」。`, `No: the answer is “${esc(q.bon)}”.`)}</div>` : ""}`;
    if (!r) b.querySelectorAll(".rep").forEach(btn => btn.addEventListener("click", () => repondre(btn.dataset.c, btn)));
    return;
  }
  let html = no(st.line) + esc(st.msg);
  if (st.fin && S.mode === "deviner" && S.repondu.size) {
    const { bons, tot, r } = score();
    html += `<div class="verdict ${r >= .7 ? "ok" : "ko"}">${r >= .9 ? '<span class="hanamaru">花丸</span>' : ""}${L(`予想：${bons} / ${tot}。`, `Predictions: ${bons} / ${tot}. `)}${
      r >= .9 ? L("コンピューターと同じように読めているね！", "You read this program just like the computer!")
      : r >= .7 ? L("あと少し！もう一度やって花丸をねらおう。", "Almost! Play again and go for the 花丸.")
      : L(`一度 ${ico("oeil")}見る モードで見てから、もう一回やってみよう。`, `Watch it once in ${ico("oeil")}Watch mode, then try again.`)}</div>`;
  } else if (st.fin) {
    html += `<div class="verdict ok">${L(`プログラム終了！次は ${ico("pense")}予想する モードで、大事な行の前に「次に何が起きるか」を当ててみよう。`, `End of the program! Now try ${ico("pense")}Predict mode: before each key line, guess what happens next.`)}</div>`;
  }
  b.innerHTML = html;
}

/* Le トレース表 suit chaque étape : les lignes terminées, puis une ligne « en cours »
   qui montre l'état actuel (cellules modifiées surlignées) jusqu'à ce que le tour soit noté. */
function majTrace() {
  const al = S.algo, th = al.trace(L), st = S.steps[S.cur];
  const rows = [];
  for (let k = 0; k <= S.cur; k++) if (S.steps[k].row) rows.push({ cells: S.steps[k].live, neuf: k === S.cur });
  const dernier = rows.length ? rows[rows.length - 1].cells : null;
  const enCours = !st.row && S.cur > 0 && (!dernier || st.live.some((c, k) => c !== dernier[k]));
  const prev = S.steps[S.cur - 1];
  const ligneHtml = (cells, cls, avant) => `<tr class="${cls}">${cells.map((c, k) =>
    `<td${avant && avant[k] !== c ? ' class="chg"' : ""}>${esc(c)}</td>`).join("")}</tr>`;
  let body = rows.map((r, k) => ligneHtml(r.cells, r.neuf ? "neuf" : "", r.neuf ? (rows[k - 1] ? rows[k - 1].cells : null) : null)).join("");
  if (enCours) body += ligneHtml(st.live, "live", prev ? prev.live : null);
  if (!body) body = `<tr class="vide"><td colspan="${th.length}">${L("ステップごとに表が埋まっていくよ。", "The table fills in at every step.")}</td></tr>`;
  const boite = $("#trace");
  boite.innerHTML = `<table class="trace"><thead><tr>${th.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table>`;
  boite.scrollTop = boite.scrollHeight;
}

/* ———————————— la loutre ———————————— */
function humeur(h) {
  const l = $("#loutre");
  l.classList.remove("parle", "joie", "oups"); void l.getBoundingClientRect();
  l.classList.add(h);
}

/* ———————————— navigation ———————————— */
function avancer() {
  if (S.attente !== null) return false;
  if (S.cur >= S.steps.length - 1) return false;
  const n = S.cur + 1;
  if (S.mode === "deviner" && S.steps[n].q && !S.repondu.has(n)) {
    S.attente = n; S.retour = null; humeur("parle"); maj();
    return false;
  }
  S.cur = n; humeur("parle");
  if (S.cur === S.steps.length - 1) fini();
  else if (S.cur > 6 && Math.random() < .06) FETE.amie("focus", LANG);
  maj();
  return true;
}

function reculer() {
  if (S.attente !== null) { S.attente = null; S.retour = null; maj(); return; }
  if (S.cur > 0) { S.cur--; maj(); }
}

function aller(k) {
  S.attente = null; S.retour = null;
  S.cur = Math.max(0, Math.min(S.steps.length - 1, k));
  maj();
}

function repondre(c, btn) {
  const q = S.steps[S.attente].q, ok = c === q.bon;
  S.repondu.set(S.attente, ok);
  S.retour = { ok, choisi: c };
  humeur(ok ? "joie" : "oups");
  if (ok) {
    S.serie++;
    FETE.confettis(btn, 28);
    if (S.serie % 4 === 0) FETE.amie("serie", LANG);
  } else {
    S.serie = 0;
    FETE.amie("erreur", LANG);
  }
  maj();
}

function continuer() {
  S.cur = S.attente; S.attente = null; S.retour = null;
  if (S.cur === S.steps.length - 1) fini();
  maj();
}

function fini() {
  const { tot, r } = score();
  if (S.mode === "deviner" && tot) {
    const scores = lire(CLE, {});
    if (scores[S.algo.id] === undefined || r > scores[S.algo.id]) { scores[S.algo.id] = r; ecrire(CLE, scores); construireChoix(); }
    humeur(r >= .7 ? "joie" : "oups");
    if (r >= .7) FETE.pluie(r >= .9 ? 220 : 120);
    setTimeout(() => FETE.amie(r >= .7 ? "fin" : "erreur", LANG), 700);
  } else {
    humeur("joie");
    FETE.pluie(110);
  }
}

/* le bouton principal : avancer, continuer après une réponse, ou recommencer à la fin */
function suivant() {
  if (S.attente !== null) { if (S.retour) continuer(); return; }
  if (S.cur >= S.steps.length - 1) { S.repondu.clear(); S.serie = 0; aller(0); return; }
  avancer();
}

/* le panneau d'exercices n'est pas modal : il couvre les deux tiers droits et laisse le programme visible */
function ouvrir(id) {
  const d = $(id);
  if (d.open) { if (d.classList.contains("panneau")) d.close(); return; }
  if (d.classList.contains("panneau")) { majExosDonnees(); d.show(); } else d.showModal();
}
function majExosDonnees() {
  const d = S.donnees;
  $("#exos-donnees").innerHTML = `<b>${L("データ", "Data")}</b><code>a = {${esc(d.a.join(", "))}}</code>${d.x !== undefined ? `<code>x = ${esc(d.x)}</code>` : ""}<span class="muted">${L(`要素数 ${d.a.length}`, `${d.a.length} elements`)}</span><button class="petit" id="exos-changer">${ico("de")}${L("変更", "Change")}</button>`;
  $("#exos-changer").addEventListener("click", () => ouvrir("#d-donnees"));
}
function fermer() {
  const modale = (() => { try { return document.querySelector("dialog:modal"); } catch { return null; } })();
  (modale ? [modale] : document.querySelectorAll("dialog[open]")).forEach(d => d.close());
}
/* à la fermeture, confettis et amies reviennent dans la page */
document.querySelectorAll("dialog").forEach(d => d.addEventListener("close", () => {
  const cv = $("#confettis"); if (cv.parentNode !== document.body) document.body.prepend(cv);
  d.querySelectorAll(".amie").forEach(a => a.remove());
}));

function choisirMode(m) {
  S.mode = m; S.repondu.clear(); S.serie = 0;
  document.querySelectorAll("#modes .mode").forEach(b => b.classList.toggle("actif", b.dataset.mode === m));
  aller(0);
}

function choisirOnglet(o) {
  S.onglet = o;
  document.querySelectorAll("#onglets button").forEach(b => b.classList.toggle("actif", b.dataset.onglet === o));
  document.querySelectorAll(".onglet").forEach(d => d.classList.toggle("actif", d.id === "o-" + o));
}

function charger(algo, donnees, garder = false) {
  let steps;
  try { steps = enregistrer(algo, donnees); }
  catch (e) { const err = $("#d-err"); if (err) err.textContent = e.message; return; }
  const cur = garder ? Math.min(S.cur, steps.length - 1) : 0;
  Object.assign(S, { algo, donnees: { ...donnees, a: donnees.a.slice() }, steps, cur });
  if (!garder) { S.attente = null; S.retour = null; S.repondu.clear(); S.serie = 0; }
  else if (S.attente !== null) S.attente = Math.min(S.attente, steps.length - 1);
  ecrire(CLE + "-dernier", algo.id);
  construireChoix(); construireIntro(); construireCode(); construireVars(); construireStage();
  construireDonnees(); construireBlancs(); construireQcm(); majExosDonnees();
  maj();
}

function choisirLangue(l) {
  if (l === LANG) return;
  LANG = l; ecrire(CLE + "-lang", l);
  appliquerTextes();
  charger(S.algo, S.donnees, true); /* les textes des étapes sont réenregistrés dans la nouvelle langue */
}

/* ———————————— démarrage ———————————— */
$("#choix").addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return;
  const al = ALGOS.find(a => a.id === b.dataset.id);
  if (al !== S.algo) charger(al, al.donnees);
});
$("#modes").addEventListener("click", e => { const b = e.target.closest(".mode"); if (b) choisirMode(b.dataset.mode); });
$("#langues").addEventListener("click", e => { const b = e.target.closest(".mode"); if (b) choisirLangue(b.dataset.lang); });
$("#onglets").addEventListener("click", e => { const b = e.target.closest("button"); if (b) choisirOnglet(b.dataset.onglet); });
$("#b-debut").addEventListener("click", () => { S.repondu.clear(); S.serie = 0; aller(0); });
$("#b-arriere").addEventListener("click", reculer);
$("#b-avant").addEventListener("click", suivant);
$("#ouvrir-donnees").addEventListener("click", () => ouvrir("#d-donnees"));
$("#ouvrir-exos").addEventListener("click", () => ouvrir("#d-exos"));
document.querySelectorAll("[data-fermer]").forEach(b => b.addEventListener("click", fermer));
document.querySelectorAll("dialog").forEach(d => d.addEventListener("click", e => { if (e.target === d) fermer(); }));
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && $("#d-exos").open && !document.querySelector("#d-donnees[open]")) { $("#d-exos").close(); return; }
  if (document.querySelector("dialog[open]") || e.target.closest("input, select, textarea")) return;
  if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
    if (e.target.closest("button") && e.key !== "ArrowRight") return; /* Espace/Entrée sur un bouton : son propre clic */
    e.preventDefault(); suivant();
  } else if (e.key === "ArrowLeft") { e.preventDefault(); reculer(); }
});

appliquerTextes();
const dernier = ALGOS.find(a => a.id === lire(CLE + "-dernier", "")) || ALGOS[0];
charger(dernier, dernier.donnees);
choisirMode("voir");
choisirOnglet("blancs");
})();
