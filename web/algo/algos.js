/* アルゴ劇場 — les algorithmes (textes en japonais et en anglais).
   Chaque algorithme décrit :
     prog     : le programme en 擬似言語, une ligne par entrée (numérotées à partir de 1)
     donnees  : { a: [...], x?: valeur cherchée }  — tableaux indicés à partir de 1, comme à l'examen
     vars     : les variables à montrer dans les boîtes, dans l'ordre
     pointeurs: variable → couleur ; la variable est dessinée comme un drapeau sous la case a[valeur]
     trace(L) : en-têtes du トレース表 · ligne(v, a, arr, o, L) : une ligne du tableau
     run(T)   : rejoue le programme. T.v = variables, T.a(i) lit a[i], T.set(i, x) écrit,
                T.L(ja, en) choisit le texte de la langue courante,
                T.step(numéro de ligne, explication, options) enregistre une image.
                options : look/cmp/ecrit/trouve = cases à colorier, row = ajouter une ligne au トレース表,
                          q = question posée en mode 予想 avant d'exécuter la ligne, fin = dernière image.
     blancs   : questions 空欄 (le texte « trou » de la ligne devient 【 a 】), expl : { ja, en }
     qcm      : { ja: [énoncé, [bonne réponse, distracteurs…], explication], en: [...] }
   Les exemples sont écrits pour ce site, dans le style des 公開問題 de l'IPA. */
window.ALGOS = [

{
  id: "max", cat: "B1", jp: "最大値を探す", en: "Finding the maximum",
  resume: { ja: "配列を先頭から順に見て、それまでで一番大きい値を覚えておく。",
            en: "Walk through the array and remember the biggest value seen so far." },
  cle: { ja: "max は a[1] から始めるので、ループは i = 2 から。ループを抜けた後、i は aの要素数 + 1 になっている。",
         en: "max starts from a[1], so the loop starts at i = 2. After the loop, i equals aの要素数 + 1." },
  prog: [
    "○整数型: saidai(整数型の配列: a)",
    "  整数型: i, max",
    "  max ← a[1]",
    "  for (i を 2 から aの要素数 まで 1 ずつ増やす)",
    "    if (a[i] > max)",
    "      max ← a[i]",
    "    endif",
    "  endfor",
    "  return max"
  ],
  donnees: { a: [5, 9, 2, 7, 11, 4] },
  vars: ["i", "max"],
  pointeurs: { i: "var(--shu)" },
  compteurs: ["cmp", "aff"],
  trace: L => ["i", "a[i]", "a[i] > max", "max"],
  ligne: (v, a, arr, o, L) => [v.i ?? "—", v.i ? a(v.i) : "—", o.ok === undefined ? "—" : (o.ok ? L("真", "true") : L("偽", "false")), v.max],
  run(T) {
    const v = T.v, L = T.L;
    T.step(1, L(`a = {${T.liste()}} を引数として saidai を呼び出す。要素数は ${T.n}。`,
                `Call saidai with a = {${T.liste()}}. It has ${T.n} elements.`));
    v.i = undefined; v.max = undefined;
    T.step(2, L("変数 i と max の箱ができる。まだ中身は空。", "Two boxes are created: i and max. They are still empty."));
    v.max = T.a(1);
    T.step(3, L(`max ← a[1]：最初の要素を「今までの最大」とする。max = ${v.max}。`,
                `max ← a[1]: the first element is “the biggest so far”. max = ${v.max}.`),
      { look: [1], row: true, q: { texte: L("この行の後、max の値は？", "What will max be after this line?"), choix: T.choix(v.max, [0, T.a(2), T.n]) } });
    for (v.i = 2; ; v.i++) {
      if (v.i > T.n) {
        T.step(4, L(`i が ${v.i} になり、aの要素数（${T.n}）を超えたのでループを抜ける。`,
                    `i becomes ${v.i}, greater than the number of elements (${T.n}): the loop ends.`),
          { q: { texte: L(`i は ${v.i}。ループは続く？`, `i is now ${v.i}. Does the loop go on?`),
                 choix: [L("続く", "it goes on"), L("抜ける", "it ends")], bon: L("抜ける", "it ends") } });
        break;
      }
      T.step(4, v.i === 2 ? L("i = 2 からループ開始。a[1] はすでに max に入っている。", "The loop starts at i = 2: a[1] is already in max.")
                          : L(`i が ${v.i} になる。`, `i becomes ${v.i}.`), { look: [v.i] });
      const ok = T.a(v.i) > v.max; T.c.cmp++;
      T.step(5, L(`a[${v.i}] = ${T.a(v.i)} ${ok ? ">" : "≤"} max = ${v.max} → ${ok ? "真" : "偽"}。`,
                  `a[${v.i}] = ${T.a(v.i)} ${ok ? ">" : "≤"} max = ${v.max} → ${ok ? "true" : "false"}.`),
        { cmp: [v.i], ok, row: !ok, q: { texte: L(`a[${v.i}] = ${T.a(v.i)}、max = ${v.max}。a[i] > max は？`, `a[${v.i}] = ${T.a(v.i)} and max = ${v.max}. Is a[i] > max?`),
                                          choix: [L("真", "true"), L("偽", "false")], bon: ok ? L("真", "true") : L("偽", "false") } });
      if (ok) {
        const ancien = v.max;
        v.max = T.a(v.i); T.c.aff++;
        T.step(6, L(`max ← a[${v.i}]：もっと大きい値が見つかった！max = ${v.max}。`, `max ← a[${v.i}]: found a bigger one! max = ${v.max}.`),
          { look: [v.i], row: true, ok, q: { texte: L("この行の後、max の値は？", "What will max be after this line?"), choix: T.choix(v.max, [ancien, v.i, ancien + 1]) } });
      }
    }
    T.step(9, L(`return max → ${v.max} を返す。`, `return max → the function returns ${v.max}.`), { fin: true });
  },
  blancs: [
    { ligne: 5, trou: "a[i] > max", choix: ["a[i] > max", "a[i] < max", "a[i] > a[1]", "max > i"],
      expl: { ja: "見ている要素のほうが大きいときだけ max を入れ替える。「a[i] < max」だと、小さい値で max が上書きされてしまう。",
              en: "max is replaced only when the element is bigger. With “a[i] < max”, max would be overwritten by smaller values." } },
    { ligne: 4, trou: "2", choix: ["2", "1", "0", "aの要素数"],
      expl: { ja: "a[1] は max の初期値に使ったので 2 から。1 からでも答えは同じだが、a[1] > a[1] という無駄な比較が1回増える。",
              en: "a[1] was already used to initialise max. Starting at 1 also works, but adds a useless comparison (a[1] > a[1])." } }
  ],
  qcm: [
    { ja: ["要素数が n のとき、5行目の if は何回実行される？", ["n − 1 回", "n 回", "n + 1 回", "n ÷ 2 回"],
           "ループは 2 から n まで、n − 1 周。1周に比較1回。画面の「比較」カウンターで確かめよう。"],
      en: ["For n elements, how many times does the if on line 5 run?", ["n − 1", "n", "n + 1", "n ÷ 2"],
           "The loop goes from 2 to n: n − 1 rounds, one comparison each. Check the “comparisons” counter."] },
    { ja: ["max の初期値を a[1] ではなく 0 にすると、正しく動かない配列は？", ["{−3, −8, −1}", "{3, 8, 1}", "{0, 5, 2}", "{9, 4}"],
           "すべて負の数だと、どれも 0 より大きくならない。配列にない 0 が返ってしまう。"],
      en: ["If max started at 0 instead of a[1], which array would give a wrong answer?", ["{−3, −8, −1}", "{3, 8, 1}", "{0, 5, 2}", "{9, 4}"],
           "If every value is negative, none is > 0: the function would return 0, which is not even in the array."] }
  ]
},

{
  id: "bubble", cat: "B3", jp: "バブルソート", en: "Bubble sort",
  resume: { ja: "隣どうしを比べ、順序が逆なら交換する。大きい値が泡のように末尾へ上がっていく。",
            en: "Compare neighbours and swap them when they are in the wrong order: the biggest value rises to the end like a bubble." },
  cle: { ja: "1回の走査が終わるたびに a[i] の位置が確定する（★）。交換には tmp が必要。なければ値が1つ消える。",
         en: "After each pass, a[i] is in its final place (★). A swap needs tmp: without it, one value would be lost." },
  prog: [
    "○bubble(整数型の配列: a)",
    "  整数型: i, j, tmp",
    "  for (i を aの要素数 から 2 まで 1 ずつ減らす)",
    "    for (j を 1 から i − 1 まで 1 ずつ増やす)",
    "      if (a[j] > a[j + 1])",
    "        tmp ← a[j]",
    "        a[j] ← a[j + 1]",
    "        a[j + 1] ← tmp",
    "      endif",
    "    endfor",
    "  endfor"
  ],
  donnees: { a: [6, 3, 8, 1, 5] },
  vars: ["i", "j", "tmp"],
  pointeurs: { i: "var(--matcha)", j: "var(--shu)" },
  compteurs: ["cmp", "swap", "aff"],
  trace: L => ["i", "j", "a[j] > a[j+1]", L("交換", "swap"), L("実行後の a", "a after")],
  ligne: (v, a, arr, o, L) => [v.i, v.j, o.ok ? L("真", "true") : L("偽", "false"), o.ok ? "✓" : "–", arr.join("  ")],
  run(T) {
    const v = T.v, L = T.L;
    T.step(1, L(`a = {${T.liste()}} を引数として bubble を呼び出す。配列はその場で整列される。`,
                `Call bubble with a = {${T.liste()}}. The array is sorted in place.`));
    v.i = undefined; v.j = undefined; v.tmp = undefined;
    T.step(2, L("3つの箱：i（走査の終わり）、j（比べる位置）、tmp（交換用の退避場所）。",
                "Three boxes: i (end of the pass), j (position being compared) and tmp (the safe spot for a swap)."));
    for (v.i = T.n; ; v.i--) {
      if (v.i < 2) { T.step(3, L(`i が ${v.i} になり 2 より小さい：もう整列するものはない。`, `i becomes ${v.i}, less than 2: nothing left to sort.`)); break; }
      T.step(3, L(`i = ${v.i}：この走査で a[1]〜a[${v.i}] の最大値を a[${v.i}] まで運ぶ。`,
                  `i = ${v.i}: this pass carries the biggest of a[1]…a[${v.i}] up to a[${v.i}].`), { look: [v.i] });
      for (v.j = 1; ; v.j++) {
        if (v.j > v.i - 1) {
          T.fixer(v.i);
          T.step(4, L(`j = ${v.j} が i − 1 = ${v.i - 1} を超えた：走査終了。a[${v.i}] = ${T.a(v.i)} の位置が確定 ★`,
                      `j = ${v.j} is past i − 1 = ${v.i - 1}: end of the pass. a[${v.i}] = ${T.a(v.i)} is in its final place ★`),
            { look: [v.i], q: { texte: L(`走査 i = ${v.i} が終わる。a[${v.i}] に確定する値は？`, `Pass i = ${v.i} ends. Which value is now fixed in a[${v.i}]?`),
                                choix: T.choix(T.a(v.i), T.arr()) } });
          break;
        }
        T.step(4, L(`j = ${v.j}：a[${v.j}] と a[${v.j + 1}] を比べる。`, `j = ${v.j}: compare a[${v.j}] and a[${v.j + 1}].`), { look: [v.j, v.j + 1] });
        const ok = T.a(v.j) > T.a(v.j + 1); T.c.cmp++;
        T.step(5, L(`a[${v.j}] = ${T.a(v.j)} ${ok ? ">" : "≤"} a[${v.j + 1}] = ${T.a(v.j + 1)} → ${ok ? "順序が逆なので交換する" : "順序は正しいので何もしない"}。`,
                    `a[${v.j}] = ${T.a(v.j)} ${ok ? ">" : "≤"} a[${v.j + 1}] = ${T.a(v.j + 1)} → ${ok ? "wrong order, swap" : "right order, leave them"}.`),
          { cmp: [v.j, v.j + 1], ok, row: !ok,
            q: { texte: L(`a[${v.j}] = ${T.a(v.j)}、a[${v.j + 1}] = ${T.a(v.j + 1)}。交換する？`, `a[${v.j}] = ${T.a(v.j)}, a[${v.j + 1}] = ${T.a(v.j + 1)}. Swap?`),
                 choix: [L("交換する", "swap"), L("しない", "no swap")], bon: ok ? L("交換する", "swap") : L("しない", "no swap") } });
        if (ok) {
          v.tmp = T.a(v.j); T.c.aff++;
          T.step(6, L(`tmp ← a[${v.j}]：${v.tmp} を tmp に退避する。`, `tmp ← a[${v.j}]: ${v.tmp} goes to safety in tmp.`), { look: [v.j] });
          T.set(v.j, T.a(v.j + 1));
          T.step(7, L(`a[${v.j}] ← a[${v.j + 1}]：見て、${T.a(v.j)} が2つになった！でも ${v.tmp} は tmp に残っている。`,
                      `a[${v.j}] ← a[${v.j + 1}]: look, ${T.a(v.j)} is now there twice! Luckily ${v.tmp} is still in tmp.`), { ecrit: [v.j] });
          T.set(v.j + 1, v.tmp); T.c.swap++;
          T.step(8, L(`a[${v.j + 1}] ← tmp：${v.tmp} が配列に戻る。交換完了。`, `a[${v.j + 1}] ← tmp: ${v.tmp} comes back into the array. Swap done.`),
            { ecrit: [v.j + 1], row: true, ok,
              q: { texte: L(`この行の後、a[${v.j + 1}] の値は？`, `What will a[${v.j + 1}] be after this line?`), choix: T.choix(v.tmp, [T.a(v.j), v.j + 1, v.i]) } });
        }
      }
    }
    T.fixer(1);
    T.step(11, L(`完了！a = {${T.liste()}} は昇順に整列された。`, `Done! a = {${T.liste()}} is sorted in ascending order.`), { fin: true });
  },
  blancs: [
    { ligne: 4, trou: "i − 1", choix: ["i − 1", "i", "aの要素数", "1"],
      expl: { ja: "a[j] と a[j + 1] を比べるので、j + 1 が i を超えてはいけない。「i」だと最初の走査で j + 1 = aの要素数 + 1 となり、配列の外に出る。",
              en: "We compare a[j] and a[j + 1], so j + 1 must not go past i. With “i”, the first pass would reach j + 1 = aの要素数 + 1, outside the array." } },
    { ligne: 8, trou: "tmp", choix: ["tmp", "a[j]", "a[j + 1]", "j"],
      expl: { ja: "7行目の後、a[j] にはもう元の a[j + 1] の値が入っている。元の a[j] の値は tmp にしか残っていない。",
              en: "After line 7, a[j] already holds the old a[j + 1]. The old a[j] only survives in tmp." } }
  ],
  qcm: [
    { ja: ["要素数 5 のとき、5行目の比較は何回行われる？", ["10 回", "5 回", "25 回", "4 回"],
           "4 + 3 + 2 + 1 = 10、つまり n(n − 1) ÷ 2。比較回数は値に関係なく、n だけで決まる。"],
      en: ["With 5 elements, how many comparisons does line 5 make?", ["10", "5", "25", "4"],
           "4 + 3 + 2 + 1 = 10, i.e. n(n − 1) ÷ 2. The number of comparisons depends only on n, not on the values."] },
    { ja: ["交換が1回も起きない配列は？", ["{1, 3, 5, 6, 8}", "{8, 6, 5, 3, 1}", "{3, 1, 5, 6, 8}", "{1, 3, 6, 5, 8}"],
           "すでに整列済みなら、比較はすべて偽。「データ」で試すと、交換カウンターは 0 のまま。"],
      en: ["Which array causes no swap at all?", ["{1, 3, 5, 6, 8}", "{8, 6, 5, 3, 1}", "{3, 1, 5, 6, 8}", "{1, 3, 6, 5, 8}"],
           "An array that is already sorted: every comparison is false. Try it in “Data”: the swap counter stays at 0."] }
  ]
},

{
  id: "binaire", cat: "B3", jp: "二分探索", en: "Binary search",
  resume: { ja: "整列済みの配列で真ん中を見て、x がありえない半分を捨てる。探す範囲は毎回半分になる。",
            en: "In a sorted array, look at the middle and throw away the half where x cannot be. The search range halves each time." },
  cle: { ja: "mid は商（切り捨て）。low ≤ high の間ループする。low > high になったら範囲は空。",
         en: "mid is the quotient (商, rounded down). The loop runs while low ≤ high; when low > high, the range is empty." },
  prog: [
    "○整数型: tansaku(整数型の配列: a, 整数型: x)",
    "  整数型: low, high, mid",
    "  low ← 1",
    "  high ← aの要素数",
    "  while (low ≤ high)",
    "    mid ← (low + high) ÷ 2 の商",
    "    if (a[mid] = x)",
    "      return mid",
    "    elseif (a[mid] < x)",
    "      low ← mid + 1",
    "    else",
    "      high ← mid − 1",
    "    endif",
    "  endwhile",
    "  return −1"
  ],
  donnees: { a: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], x: 23 },
  trie: true,
  vars: ["x", "low", "high", "mid"],
  pointeurs: { low: "var(--matcha)", mid: "var(--shu)", high: "var(--ai)" },
  zone: v => (v.low === undefined ? null : [v.low, v.high]),
  compteurs: ["cmp"],
  trace: L => ["low", "high", "mid", "a[mid]", "a[mid] ? x"],
  ligne: (v, a, arr, o) => [v.low, v.high, v.mid, a(v.mid), o.signe],
  run(T) {
    const v = T.v, L = T.L;
    v.x = T.x;
    T.step(1, L(`要素数 ${T.n} の整列済み配列から x = ${T.x} を探す。`, `Look for x = ${T.x} in a sorted array of ${T.n} elements.`));
    v.low = undefined; v.high = undefined; v.mid = undefined;
    T.step(2, L("low と high は x がまだありうる範囲の両端。mid はその真ん中。",
                "low and high are the two ends of the range where x can still be; mid will be its middle."));
    v.low = 1;
    T.step(3, L("low ← 1：範囲は先頭から始まる。", "low ← 1: the range starts at the first cell."));
    v.high = T.n;
    T.step(4, L(`high ← ${T.n}：範囲は末尾まで。配列全体が候補。`, `high ← ${T.n}: the range ends at the last cell. The whole array is possible.`));
    while (true) {
      const cont = v.low <= v.high;
      T.step(5, L(`low = ${v.low} ${cont ? "≤" : ">"} high = ${v.high} → ${cont ? "範囲は空ではない。続ける" : "範囲が空。ループを抜ける"}。`,
                  `low = ${v.low} ${cont ? "≤" : ">"} high = ${v.high} → ${cont ? "the range is not empty, go on" : "the range is empty, exit"}.`),
        { q: { texte: L(`low = ${v.low}、high = ${v.high}。ループに入る？`, `low = ${v.low}, high = ${v.high}. Enter the loop?`),
               choix: [L("入る", "enter"), L("抜ける", "exit")], bon: cont ? L("入る", "enter") : L("抜ける", "exit") } });
      if (!cont) break;
      const somme = v.low + v.high;
      v.mid = Math.floor(somme / 2);
      T.step(6, L(`mid ← (${v.low} + ${v.high}) ÷ 2 の商 = ${somme} ÷ 2 → ${v.mid}${somme % 2 ? "（余りは捨てる）" : ""}。`,
                  `mid ← (${v.low} + ${v.high}) ÷ 2 の商 = ${somme} ÷ 2 → ${v.mid}${somme % 2 ? " (keep the quotient, drop the remainder)" : ""}.`),
        { look: [v.mid], q: { texte: L(`(${v.low} + ${v.high}) ÷ 2 の商 = ?`, `Quotient of (${v.low} + ${v.high}) ÷ 2 = ?`), choix: T.choix(v.mid, [v.mid + 1, somme, v.mid - 1]) } });
      const am = T.a(v.mid); T.c.cmp++;
      const signe = am === T.x ? "=" : am < T.x ? "<" : ">";
      const B = { "=": L("= : 見つかった", "= : found"), "<": L("< : x は右側", "< : x is to the right"), ">": L("> : x は左側", "> : x is to the left") };
      T.step(7, L(`a[${v.mid}] = ${am} ${signe === "=" ? "=" : "≠"} x = ${T.x}。`, `a[${v.mid}] = ${am} ${signe === "=" ? "=" : "≠"} x = ${T.x}.`),
        { cmp: [v.mid], ok: signe === "=", row: true, signe,
          q: { texte: L(`a[mid] = ${am}、x = ${T.x}。どうなる？`, `a[mid] = ${am} and x = ${T.x}. What happens?`), choix: [B["="], B["<"], B[">"]], bon: B[signe] } });
      if (signe === "=") {
        T.step(8, L(`見つかった！return ${v.mid}：x は ${v.mid} 番目にある。比較は ${T.c.cmp} 回。`,
                    `Found it! return ${v.mid}: x is in cell ${v.mid}. It took ${T.c.cmp} comparison${T.c.cmp > 1 ? "s" : ""}.`), { trouve: [v.mid], fin: true });
        return;
      }
      if (signe === "<") {
        T.step(9, L(`${am} < ${T.x}：整列済みなので、x は mid より左にはない。`, `${am} < ${T.x}: the array is sorted, so x cannot be left of mid.`), { cmp: [v.mid] });
        v.low = v.mid + 1;
        T.step(10, L(`low ← mid + 1 = ${v.low}：mid を含む左半分を捨てる。`, `low ← mid + 1 = ${v.low}: drop the left half, mid included.`),
          { q: { texte: L("この行の後、low の値は？", "What will low be after this line?"), choix: T.choix(v.low, [v.mid, v.mid - 1, v.high]) } });
      } else {
        T.step(9, L(`${am} は ${T.x} より小さくない：elseif ではない。`, `${am} is not < ${T.x}: not the elseif branch.`));
        T.step(11, L(`else：${am} > ${T.x} なので、x は mid より左にある。`, `else: ${am} > ${T.x}, so x is left of mid.`), { cmp: [v.mid] });
        v.high = v.mid - 1;
        T.step(12, L(`high ← mid − 1 = ${v.high}：mid を含む右半分を捨てる。`, `high ← mid − 1 = ${v.high}: drop the right half, mid included.`),
          { q: { texte: L("この行の後、high の値は？", "What will high be after this line?"), choix: T.choix(v.high, [v.mid, v.mid + 1, v.low]) } });
      }
    }
    T.step(15, L(`x = ${T.x} は配列にない：return −1。`, `x = ${T.x} is not in the array: return −1.`), { fin: true });
  },
  blancs: [
    { ligne: 10, trou: "mid + 1", choix: ["mid + 1", "mid", "mid − 1", "high"],
      expl: { ja: "a[mid] はもう比べて x ではなかったので除いてよい。「low ← mid」だと範囲が縮まらず、無限ループになることがある。",
              en: "a[mid] has already been compared and is not x, so it can be dropped. With “low ← mid”, the range may stop shrinking → infinite loop." } },
    { ligne: 5, trou: "low ≤ high", choix: ["low ≤ high", "low < high", "low = high", "mid ≤ high"],
      expl: { ja: "low = high のとき、まだ1マス調べていない。「low < high」だとそれを調べずに抜け、x を見逃す。",
              en: "When low = high, one cell is still left to check. With “low < high”, the loop would exit without checking it and miss x." } }
  ],
  qcm: [
    { ja: ["要素数 1000 のとき、比較回数の最大はおよそ？", ["約 10 回", "約 100 回", "500 回", "1000 回"],
           "毎回範囲が半分になる：1000 → 500 → 250 → … → 1、約 log₂1000 ≈ 10 回。"],
      en: ["With 1000 elements, what is the maximum number of comparisons, roughly?", ["about 10", "about 100", "500", "1000"],
           "The range halves each round: 1000 → 500 → 250 → … → 1, about log₂1000 ≈ 10 rounds."] },
    { ja: ["a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91}、x = 23 のとき、最初の mid は？", ["5", "6", "4", "10"],
           "(1 + 10) ÷ 2 = 5.5 → 商は 5。a[5] = 16 を見る。"],
      en: ["With a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91} and x = 23, what is the first mid?", ["5", "6", "4", "10"],
           "(1 + 10) ÷ 2 = 5.5 → the quotient is 5. We look at a[5] = 16."] }
  ]
}

];
