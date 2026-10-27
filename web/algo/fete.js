/* アルゴ劇場 — confettis et « amies » qui encouragent.
   Les amies sont des personnages originaux dessinés en SVG (aucune photo de personne réelle). */
(() => {
"use strict";
const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ———————————— confettis ———————————— */
const cv = document.getElementById("confettis");
const ctx = cv.getContext("2d");
const COULEURS = ["#f38ba8", "#f9c6d6", "#c8381f", "#f5c84b", "#9cd3b6", "#a8c8f0", "#c9b2ef", "#ffffff"];
let parts = [], anim = null;

function taille() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
addEventListener("resize", taille); taille();

function ajouter(x, y, n, force, haut) {
  for (let k = 0; k < n; k++) {
    const ang = haut ? Math.PI / 2 + (Math.random() - .5) * .6 : -Math.PI / 2 + (Math.random() - .5) * 2.2;
    const v = force * (.45 + Math.random() * .75);
    parts.push({
      x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v * (haut ? .3 : 1),
      r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3,
      w: 6 + Math.random() * 6, h: 4 + Math.random() * 5,
      c: COULEURS[Math.floor(Math.random() * COULEURS.length)],
      forme: Math.random() < .25 ? "coeur" : Math.random() < .5 ? "rond" : "rect",
      vie: 0, max: 110 + Math.random() * 70
    });
  }
  if (!anim) anim = requestAnimationFrame(boucle);
}

function coeur(s) {
  ctx.beginPath();
  ctx.moveTo(0, s * .3);
  ctx.bezierCurveTo(-s, -s * .4, -s * .4, -s * 1.1, 0, -s * .45);
  ctx.bezierCurveTo(s * .4, -s * 1.1, s, -s * .4, 0, s * .3);
  ctx.fill();
}

function boucle() {
  const d = devicePixelRatio;
  ctx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.vie < p.max && p.y < innerHeight + 40);
  for (const p of parts) {
    p.vie++; p.vx *= .985; p.vy = p.vy * .985 + .22; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (p.max - p.vie) / 30);
    ctx.translate(p.x * d, p.y * d); ctx.rotate(p.r); ctx.scale(d, d);
    ctx.fillStyle = p.c;
    if (p.forme === "coeur") coeur(p.w * .8);
    else if (p.forme === "rond") { ctx.beginPath(); ctx.arc(0, 0, p.h * .6, 0, 7); ctx.fill(); }
    else { ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.vie / 6))); }
    ctx.restore();
  }
  anim = parts.length ? requestAnimationFrame(boucle) : null;
  if (!anim) ctx.clearRect(0, 0, cv.width, cv.height);
}

/* petite gerbe depuis un élément · grande pluie depuis le haut */
function confettis(el, n = 36) {
  if (calme) return;
  const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  ajouter(r.left + r.width / 2, r.top + r.height / 2, n, 9);
}
function pluie(n = 140) {
  if (calme) return;
  for (let k = 0; k < 6; k++) setTimeout(() => {
    for (let j = 0; j < n / 6; j++) ajouter(Math.random() * innerWidth, -10, 1, 3, true);
  }, k * 120);
}

/* ———————————— les amies ———————————— */
const AMIES = [
  { nom: { ja: "ももか", en: "Momoka" }, cheveux: "#7a4a3a", robe: "#f6a9c2", robe2: "#fde3ec", noeud: "#f38ba8", coiffure: "couettes", objet: "baguette" },
  { nom: { ja: "そら", en: "Sora" }, cheveux: "#3b3340", robe: "#a8cdf2", robe2: "#e6f2fd", noeud: "#7fb2e8", coiffure: "longs", objet: "coeur" },
  { nom: { ja: "すみれ", en: "Sumire" }, cheveux: "#a2553e", robe: "#c9b2ef", robe2: "#f1eafc", noeud: "#a68be0", coiffure: "couettes", objet: "etoile" },
  { nom: { ja: "みんと", en: "Minto" }, cheveux: "#5b4636", robe: "#a6dcc6", robe2: "#e5f6ef", noeud: "#f9c6d6", coiffure: "chignons", objet: "eventail" }
];

function dessin(a) {
  const ch = a.cheveux;
  const coiffure = {
    couettes: `<ellipse cx="22" cy="62" rx="13" ry="26" fill="${ch}" transform="rotate(14 22 62)"/><ellipse cx="98" cy="62" rx="13" ry="26" fill="${ch}" transform="rotate(-14 98 62)"/>`,
    longs: `<path d="M28 50 Q22 100 34 112 L86 112 Q98 100 92 50 Z" fill="${ch}"/>`,
    chignons: `<circle cx="34" cy="22" r="12" fill="${ch}"/><circle cx="86" cy="22" r="12" fill="${ch}"/>`
  }[a.coiffure];
  const objet = {
    baguette: `<line x1="100" y1="128" x2="112" y2="78" stroke="#fff" stroke-width="4" stroke-linecap="round"/><line x1="100" y1="128" x2="112" y2="78" stroke="${a.noeud}" stroke-width="2" stroke-dasharray="3 3"/><circle cx="113" cy="72" r="9" fill="${a.robe2}" stroke="${a.noeud}" stroke-width="2"/><path d="M113 66 L115 71 L120 71 L116 74 L117.5 79 L113 76 L108.5 79 L110 74 L106 71 L111 71 Z" fill="${a.noeud}"/>`,
    coeur: `<path d="M108 122 C96 110 100 98 108 104 C116 98 120 110 108 122 Z" fill="${a.noeud}" stroke="#fff" stroke-width="2"/>`,
    etoile: `<path d="M110 92 L114 102 L125 102 L116 109 L119 120 L110 113 L101 120 L104 109 L95 102 L106 102 Z" fill="#f5d36b" stroke="#fff" stroke-width="2"/>`,
    eventail: `<path d="M104 122 L88 96 A30 30 0 0 1 122 92 Z" fill="${a.robe2}" stroke="${a.noeud}" stroke-width="2"/><path d="M104 122 L95 95 M104 122 L104 92 M104 122 L113 93" stroke="${a.noeud}" stroke-width="1.2"/>`
  }[a.objet];
  const volants = Array.from({ length: 7 }, (_, k) => `<circle cx="${30 + k * 10}" cy="146" r="6" fill="#fff"/>`).join("");
  /* 3 frames : f0 repos · f1 parle (bras levé, bouche ouverte, petit saut) · f2 clin d'œil */
  return `<svg viewBox="0 0 130 175" aria-hidden="true"><g class="corps">
    ${coiffure}
    <rect x="49" y="148" width="7" height="16" rx="3" fill="#fff" stroke="#e8d3da"/><rect x="64" y="148" width="7" height="16" rx="3" fill="#fff" stroke="#e8d3da"/>
    <ellipse cx="52" cy="167" rx="8" ry="5" fill="${a.noeud}"/><ellipse cx="68" cy="167" rx="8" ry="5" fill="${a.noeud}"/>
    <path d="M44 92 L76 92 L100 146 L20 146 Z" fill="${a.robe}"/>
    ${volants}
    <path d="M44 92 L76 92 L82 118 L38 118 Z" fill="${a.robe2}"/>
    <path d="M52 100 L60 108 L68 100" fill="none" stroke="${a.noeud}" stroke-width="2.5"/>
    <ellipse cx="38" cy="98" rx="11" ry="9" fill="${a.robe2}" stroke="${a.robe}" stroke-width="2"/><ellipse cx="82" cy="98" rx="11" ry="9" fill="${a.robe2}" stroke="${a.robe}" stroke-width="2"/>
    <path d="M30 104 Q24 118 32 126" stroke="#ffe3d6" stroke-width="7" fill="none" stroke-linecap="round"/>
    <g class="bras"><path d="M90 104 Q98 118 100 126" stroke="#ffe3d6" stroke-width="7" fill="none" stroke-linecap="round"/>${objet}</g>
    <circle cx="60" cy="56" r="32" fill="#ffe8dc"/>
    <path d="M27 58 Q26 22 60 21 Q94 22 93 58 Q86 40 74 38 Q66 48 52 40 Q40 46 27 58 Z" fill="${ch}"/>
    <ellipse cx="47" cy="62" rx="5.5" ry="7.5" fill="#3a2630"/>
    <circle cx="49" cy="59" r="2.2" fill="#fff"/><circle cx="46" cy="65" r="1" fill="#fff"/>
    <g class="oeil-ouvert"><ellipse cx="73" cy="62" rx="5.5" ry="7.5" fill="#3a2630"/><circle cx="75" cy="59" r="2.2" fill="#fff"/><circle cx="72" cy="65" r="1" fill="#fff"/></g>
    <path class="oeil-clin" d="M67 63 Q73 57 79 63" fill="none" stroke="#3a2630" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="39" cy="72" rx="6" ry="3.5" fill="#f7a8bd" opacity=".7"/><ellipse cx="81" cy="72" rx="6" ry="3.5" fill="#f7a8bd" opacity=".7"/>
    <path class="bouche-f" d="M55 74 Q60 79 65 74" fill="none" stroke="#c45a6e" stroke-width="2" stroke-linecap="round"/>
    <ellipse class="bouche-o" cx="60" cy="76" rx="4" ry="3.6" fill="#c45a6e"/>
    <path d="M60 22 L40 10 Q36 24 60 22 Z M60 22 L80 10 Q84 24 60 22 Z" fill="${a.noeud}" stroke="#fff" stroke-width="1.5"/><circle cx="60" cy="21" r="5" fill="${a.noeud}" stroke="#fff" stroke-width="1.5"/>
  </g></svg>`;
}

const PHRASES = {
  erreur: [
    ["大丈夫！間違えたところが一番覚えるところだよ✨", "It’s okay! The mistakes are what you remember best ✨"],
    ["おしい！次はきっと当たるよ💕", "So close! You’ll get the next one 💕"],
    ["ちょっと難しかったね。でもちゃんとできてるよ！", "That one was a bit hard. You’re still doing great!"],
    ["間違えてもOK！トレース表を見てみよう📝", "Mistakes are fine! Take a look at the trace table 📝"],
    ["ここ、みんな間違えるところだよ。気にしないで！", "Everyone trips on this one. Don’t worry!"],
    ["深呼吸して、変数の箱をもう一回見てみよう🎀", "Deep breath, then look at the variable boxes again 🎀"],
    ["失敗は成功のもと！がんばってるの、ちゃんと見てるよ", "Every mistake is a step forward! I can see how hard you’re trying"],
    ["今のでひとつ賢くなったね⭐", "You just got a little smarter ⭐"],
    ["難しいけど、ちゃんと前に進んでるよ！", "It’s tough, but you’re really making progress!"],
    ["焦らなくていいよ。一行ずつ、一緒にいこう", "No rush. One line at a time, together"],
    ["本番じゃなくてよかった〜！ここで覚えちゃおう💪", "Better here than on exam day! Let’s lock it in 💪"],
    ["その考え方、半分は合ってたよ！あと少し！", "Your idea was half right! Almost there!"],
    ["間違いは宝物。次の一問でとり返そう🌸", "Mistakes are treasure. Let’s win the next one 🌸"],
    ["むずかしい所に挑戦してるってこと。えらい！", "It means you’re tackling the hard part. Proud of you!"]
  ],
  focus: [
    ["集中、集中〜！いい感じだよ🎀", "Focus, focus! You’re doing nicely 🎀"],
    ["いい調子！そのまま一行ずつね", "Good pace! Keep going one line at a time"],
    ["今どの行にいるか、指でたどってみて☝️", "Try following the current line with your finger ☝️"],
    ["変数の値、ちゃんと追えてる？えらい！", "Keeping track of the variables? Amazing!"],
    ["疲れたら、ひと休みしてもいいからね☕", "If you’re tired, a little break is okay ☕"],
    ["このペースなら試験もばっちり！", "At this pace, the exam will go great!"],
    ["次に何が起きるか、先に考えてからボタンを押してみて🤔", "Guess what happens next before you press the button 🤔"],
    ["ちょっと難しくても、ちゃんとできてるよ！", "Even when it’s hard, you’re doing super well!"]
  ],
  serie: [
    ["連続正解！すごすぎ✨", "Right again and again! Amazing ✨"],
    ["天才では…？👑", "Are you… a genius? 👑"],
    ["完璧なトレース！その調子〜💕", "Perfect trace! Keep it up 💕"],
    ["コンピューターの気持ちがわかってきたね🌟", "You’re starting to think like the computer 🌟"]
  ],
  fin: [
    ["最後までできたね！おつかれさま🎉", "You made it to the end! Well done 🎉"],
    ["一周完走！もう一回やるともっと速くなるよ✨", "Full run done! Once more and you’ll be even faster ✨"]
  ]
};

let visible = null, dernier = 0, cote = 1, derniereAmie = -1, dernierePhrase = {};
function choisir(arr, cle) {
  let k; do { k = Math.floor(Math.random() * arr.length); } while (arr.length > 1 && k === dernierePhrase[cle]);
  dernierePhrase[cle] = k; return arr[k];
}

/* type : "erreur" | "focus" | "serie" | "fin" · lang : "ja" | "en" */
function amie(type, lang) {
  if (visible || calme && type === "focus") return false;
  const now = Date.now();
  if (type === "focus" && now - dernier < 25000) return false;
  dernier = now;
  let k; do { k = Math.floor(Math.random() * AMIES.length); } while (k === derniereAmie);
  derniereAmie = k;
  const a = AMIES[k], p = choisir(PHRASES[type], type);
  cote = -cote;
  const el = document.createElement("div");
  el.className = `amie ${cote > 0 ? "droite" : "gauche"}`;
  el.innerHTML = `<div class="amie-bulle"><b>${a.nom[lang]}</b>${p[lang === "ja" ? 0 : 1]}</div>${dessin(a)}`;
  el.addEventListener("click", () => partir(el));
  document.body.appendChild(el);
  visible = el;
  const seq = [0, 1, 0, 1, 0, 2];   /* parle, parle, clin d'œil */
  let f = 0;
  el.dataset.f = 0;
  if (!calme) el._frames = setInterval(() => { f = (f + 1) % seq.length; el.dataset.f = seq[f]; }, 260);
  setTimeout(() => el.classList.add("la"), 40 + Math.random() * 250);
  setTimeout(() => partir(el), 4200 + p[0].length * 40);
  return true;
}
function partir(el) {
  if (!el.isConnected || el.classList.contains("part")) return;
  clearInterval(el._frames); el.dataset.f = 0;
  el.classList.remove("la"); el.classList.add("part");
  setTimeout(() => { el.remove(); if (visible === el) visible = null; }, 600);
}

window.FETE = { confettis, pluie, amie };
})();
