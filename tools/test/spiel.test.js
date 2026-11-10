const { load, lists } = require('./harness');
const units = lists();
const day = (y, m, d, h = 10) => new Date(y, m - 1, d, h, 0, 0).getTime();
const ymd = t => { const x = new Date(t); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0') };
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('  FAIL', msg) } };
const fresh = (clock, extra) => load({ clock, storage: { 'wordbox.units.v1': JSON.stringify(units), 'wordbox.prog.v1': JSON.stringify(Object.assign({ v: 1, econ: 2, tempo: 'fast', onboarded: true, v2: true, sound: false, speak: false, goal: 150, goalDay: '', targetsDone: 0 }, extra || {})) } });
// plays one round; right = function(i) → answer question i correctly?
function play(A, ids, mode, right = () => true, n = 10, opts) {
  A.startRound(ids, mode, n, opts); const Q = A.S.quiz; if (!Q) return null;
  let i = 0;
  while (A.S.quiz) {
    const q = A.S.quiz.list[A.S.quiz.i];
    if (q.type === 'type') A.settle(right(i), false); else A.answerMC(right(i) ? q.options.indexOf(q.answer) : q.options.findIndex(o => o !== q.answer));
    i++; A.nextQ();
  }
  return A.S.result;
}

// ---- T4: streak and Serien-Schutz across days, including the clock change on 25 Oct ----
{
  const clock = { t: day(2026, 10, 22) }; const A = fresh(clock); const all = A.S.words.map(w => w.id);
  play(A, all, 'mix'); ok(A.S.prog.streak === 1, 'day 1 streak 1');
  clock.t = day(2026, 10, 23); play(A, all, 'mix'); ok(A.S.prog.streak === 2, 'day 2 streak 2');
  clock.t = day(2026, 10, 24); play(A, all, 'mix'); play(A, all, 'mix'); ok(A.S.prog.streak === 3, 'two rounds on one day count once: ' + A.S.prog.streak);
  clock.t = day(2026, 10, 25, 23); play(A, all, 'mix'); clock.t = day(2026, 10, 26, 0); ok(A.streakInfo().n === 4, 'streak holds over the DST night: ' + A.streakInfo().n);
  clock.t = day(2026, 10, 26, 7); play(A, all, 'mix'); ok(A.S.prog.streak === 5, 'day after DST change: ' + A.S.prog.streak);
  // miss the 27th with one freeze in the bag
  A.S.prog.freezes = 1; clock.t = day(2026, 10, 28, 9);
  const inf = A.streakInfo(); ok(inf.n === 5 && inf.frozen === 1 && !inf.today, 'protected streak still shown: ' + JSON.stringify(inf));
  const R = play(A, all, 'mix'); ok(A.S.prog.streak === 6 && A.S.prog.freezes === 0 && A.S.prog.frozen['2026-10-27'] === 1 && R.saved === 1, 'freeze used: streak ' + A.S.prog.streak + ' freezes ' + A.S.prog.freezes);
  ok(R.steps.indexOf('streak') > 0, 'streak screen in result: ' + R.steps);
  // miss two days with one freeze: gone
  A.S.prog.freezes = 1; clock.t = day(2026, 10, 31, 9); ok(A.streakInfo().n === 0, 'two missed days with one freeze: streak shown 0');
  play(A, all, 'mix'); ok(A.S.prog.streak === 1 && A.S.prog.freezes === 1, 'restart at 1, freeze kept: ' + A.S.prog.streak + '/' + A.S.prog.freezes);
  ok(A.S.prog.best === 6, 'best kept: ' + A.S.prog.best);
  console.log('T4 streak ok, week keys', Object.keys(A.S.prog.roundDays).length);
}

// ---- T5: quests are stable per day, differ between days, pay once ----
{
  const clock = { t: day(2026, 11, 10) }; const A = fresh(clock); const seen = new Set();
  for (let d = 0; d < 30; d++) {
    clock.t = day(2026, 11, 1 + d); const q = A.questsToday(), again = JSON.stringify(A.questsToday().list);
    ok(q.list.length === 3 && new Set(q.list.map(x => x[0])).size === 3, 'three distinct quests on day ' + d + ': ' + JSON.stringify(q.list));
    ok(again === JSON.stringify(q.list), 'stable within the day');
    q.list.forEach(([id, need]) => { ok(A.QUESTS[id] && A.QUESTS[id].steps.indexOf(need) >= 0, 'valid step ' + id + ' ' + need); seen.add(id) });
  }
  console.log('T5 quest kinds over 30 days:', Array.from(seen).join(', '));
  clock.t = day(2026, 11, 10); const B = fresh(clock); const all = B.S.words.map(w => w.id);
  const c0 = B.S.prog.coins || 0; let R, rounds = 0;
  do { R = play(B, all, 'mix'); rounds++ } while (!B.questsToday().chest && rounds < 12);
  ok(B.questsToday().chest, 'all quests reachable by plain rounds within 12 rounds: ' + JSON.stringify(B.questsToday()));
  const before = B.S.prog.coins; B.checkQuests(); ok(B.S.prog.coins === before, 'quests pay once');
  console.log('   chest after', rounds, 'rounds, coins', c0, '→', B.S.prog.coins, 'questsDone', B.S.prog.questsDone, 'xp', B.S.prog.xp);
}

// ---- T6: learning target quota reaches zero for the day ----
{
  const clock = { t: day(2026, 11, 10) }; const A = fresh(clock);
  const ids = units[1].words.slice(0, 20).map(w => w.id), base = {}; ids.forEach(id => base[id] = 0);
  const t = { id: 'x', title: 'Test', due: ymd(day(2026, 11, 14)), ids, base, need: 2, created: ymd(clock.t), done: '' }; A.S.prog.targets = [t];
  let i = A.targetInfo(t); ok(i.todayDue === 4 && i.state === 'ok', 'quota day 1: ' + i.todayDue + ' ' + i.state);
  ids.slice(0, 4).forEach(id => { A.S.prog.w[id] = { l: 2, r: 2, x: 0, s: 0, d: 0 } });
  i = A.targetInfo(t); ok(i.done === 4 && i.todayDue === 0, 'done for today: ' + i.todayDue);
  clock.t = day(2026, 11, 11); i = A.targetInfo(t); ok(i.todayDue === 4, 'next day quota again 4: ' + i.todayDue);
  A.S.prog.targets = [{ id: 'e', title: 'Leer', due: '2026-11-20', ids: ['gibtsnicht'], base: {}, need: 2, created: '2026-11-10', done: '' }];
  ok(A.targetInfo(A.S.prog.targets[0]).state === 'empty' && A.checkTargets().length === 0, 'empty target is not done');
  console.log('T6 targets ok');
}

// ---- T7: a perfect round books XP, coins, goal, level and builds the result screens ----
{
  const clock = { t: day(2026, 11, 10) }; const A = fresh(clock, { xp: 995, goal: 100 }); const all = A.S.words.map(w => w.id);
  const c0 = A.S.prog.coins || 0; const R = play(A, all, 'mix'); const p = A.S.prog;
  ok(R.right === 10 && R.wrong === 0 && R.perfect, 'perfect round');
  ok(R.xp === p.xp - 995, 'result XP equals booked XP: ' + R.xp + ' vs ' + (p.xp - 995));
  ok(R.levelUp && R.steps.indexOf('level') > 0, 'level up 995 → ' + p.xp + ': ' + R.steps);
  ok(p.rounds === 1 && p.perfect === 1 && p.streak === 1, 'counters');
  ok(R.coinSum === p.coins - c0, 'coin sum shown ' + R.coinSum + ' equals wallet change ' + (p.coins - c0));
  const R2 = play(A, all, 'mix', i => i !== 2); ok(R2.wrong >= 1 && R2.steps[R2.steps.length - 1] === 'review', 'mistake → review last: ' + R2.steps);
  ok(A.xpToday() >= 0 && p.goalDays <= 1, 'goal counted at most once: ' + p.goalDays);
  // result screens render
  for (let s = 0; s < R2.steps.length; s++) { A.S.result.step = s; A.S.view = 'result'; try { A.render(); ok(A.els.app.innerHTML.length > 300, 'step ' + R2.steps[s]) } catch (e) { fails++; console.log('  FAIL result step', R2.steps[s], e.message) } }
  // a wrong answer on the last question is not repeated at once
  A.startRound(all.slice(0, 40), 'en-de', 5, { extras: false }); const Q = A.S.quiz; const len0 = Q.list.length;
  for (let i = 0; i < len0 - 1; i++) { const q = Q.list[Q.i]; A.answerMC(q.options.indexOf(q.answer)); A.nextQ() }
  const ql = Q.list[Q.i]; A.answerMC(ql.options.findIndex(o => o !== ql.answer)); ok(Q.list.length === len0, 'no requeue at the very end: ' + Q.list.length + ' vs ' + len0); A.nextQ();
  console.log('T7 round ok: xp', p.xp, 'coins', p.coins, 'steps', R.steps.join('>'), '|', R2.steps.join('>'));
}

// ---- T8: short rounds give no round bonus; goal pays once; empty mode gives no round; quit with reward shows result ----
{
  const clock = { t: day(2026, 11, 10) }; const A = fresh(clock); const p = A.S.prog;
  const one = [A.S.words[0].id]; const R = play(A, one, 'en-de', () => true, 1, { extras: false });
  ok(R.xp === 2 && p.rounds === 0 && p.streak === 1, 'one-question round: xp ' + R.xp + ' rounds ' + p.rounds + ' streak ' + p.streak);
  p.days[A.todayKey()] = 160; ok(A.payGoal() === true && A.payGoal() === false && p.goalDays === 1, 'goal pays once');
  p.goal = 100; ok(A.payGoal() === false, 'changing the goal does not pay again');
  const noOpp = A.S.words.filter(w => !w.opp).slice(0, 10).map(w => w.id);
  ok(A.buildRound(noOpp, 'opp', 10, true).length === 0, 'no round from strangers when nothing fits');
  // quit after the answer that completes a learning target → result is shown
  const id = A.S.words[5].id; p.w[id] = { l: 2, r: 1, x: 0, s: 0, d: 0 };
  p.targets = [{ id: 'q', title: 'Q', due: '2026-11-20', ids: [id], base: { [id]: 0 }, need: 2, created: '2026-11-10', done: '' }];
  A.startRound([id, A.S.words[6].id, A.S.words[7].id], 'en-de', 3, { extras: false });
  while (A.S.quiz && A.S.quiz.list[A.S.quiz.i].wid !== id) { const q = A.S.quiz.list[A.S.quiz.i]; A.answerMC(q.options.indexOf(q.answer)); A.nextQ() }
  if (A.S.quiz) { const q = A.S.quiz.list[A.S.quiz.i]; A.answerMC(q.options.indexOf(q.answer)); A.finish(true) }
  ok(A.S.result && A.S.result.targetsDone.length === 1 && p.targetsDone === 1, 'quit with a finished target shows the result');
  console.log('T8 edge cases ok');
}

// ---- T9: stations of the learning path ----
{
  const A = fresh({ t: day(2026, 11, 10) });
  for (const x of A.allNodes()) console.log('   ' + x.u.title + ':', x.nodes.map(n => n.title.replace(/^S\. /, '') + ' (' + n.words.length + ')').join(' | '));
  const total = A.allNodes().reduce((a, x) => a + x.nodes.reduce((b, n) => b + n.words.length, 0), 0);
  ok(total === A.S.words.length, 'every word sits in exactly one station: ' + total + ' of ' + A.S.words.length);
}
// ---- skins: every figure draws in every mood, buying and switching books correctly ----
{
  const A = fresh({ t: day(2026, 11, 10) }, { coins: 100 });
  const moods = ['happy', 'cheer', 'oops', 'think', 'wow', 'sleep'], ids = [''].concat(A.OUTFITS.map(o => o.id));
  let bad = 0;
  for (const id of ids) for (const m of moods) { const svg = A.bit(m, id); if (!/^<svg[\s\S]*<\/svg>$/.test(svg) || /NaN|undefined/.test(svg)) bad++ }
  ok(!bad, 'figures with broken drawing: ' + bad);
  ok(A.OUTFITS.every(o => A.SKINS[o.id] && o.cost > 0 && o.tier >= 1 && o.tier <= 3), 'every skin has colours, a price and a rarity');
  ok(A.bit('happy', 'gibtsnicht') === A.bit('happy', ''), 'an unknown skin falls back to Bit');
  const tap = (act, o) => A.ACT[act]({ dataset: { o } });
  tap('wear', 'ninja'); ok(!A.S.prog.outfit, 'a skin that is not owned cannot be worn');
  tap('buy-outfit', 'ninja'); ok(A.S.prog.outfit === 'ninja' && A.S.prog.outfits.ninja, 'bought skin is worn at once');
  const afterFirst = A.S.prog.coins;
  ok(afterFirst === 100 - 30 + 5, 'ninja costs 30, the first skin brings a badge worth 5: ' + afterFirst);
  tap('buy-outfit', 'ninja'); ok(A.S.prog.coins === afterFirst, 'a skin is paid only once');
  tap('buy-outfit', 'dragon'); ok(!A.S.prog.outfits.dragon && A.S.prog.coins === afterFirst, 'no purchase without enough coins');
  tap('wear', ''); ok(A.S.prog.outfit === '', 'back to Bit');
  tap('wear', 'ninja'); ok(A.S.prog.outfit === 'ninja', 'and to the skin again');
  A.S.view = 'shop'; A.render(); ok(/Skins für Bit/.test(A.els.app.innerHTML) && /1 von 6/.test(A.els.app.innerHTML), 'shop shows the skins and the count');
  const saved = JSON.parse(A.mem['wordbox.prog.v1']); ok(saved.outfit === 'ninja' && saved.coins === afterFirst, 'skin and coins are saved');
  console.log('T skins:', ids.length, 'figures x', moods.length, 'moods');
}
// ---- findings of the review on 10.11.2026 ----
{
  const restart = (A, clock) => load({ clock, storage: A.mem });
  const ids = units[1].words.map(w => w.id);
  // level reached, app closed before the round ended: coins and level are booked at the next start
  {
    const clock = { t: day(2026, 11, 10) };
    let A = fresh(clock, { xp: 95, lvl: 1 });
    A.startRound(ids, 'de-en', 10, { extras: false });
    for (let i = 0; i < 6; i++) { const q = A.S.quiz.list[A.S.quiz.i]; A.answerMC(q.options.indexOf(q.answer)); if (i < 5) A.nextQ() }
    ok(A.levelInfo(A.S.prog.xp).n === 2 && A.S.prog.lvl === 1, 'level 2 reached inside the round, not paid yet');
    const before = A.S.prog.coins;
    A = restart(A, clock);
    ok(A.S.prog.lvl === 2 && A.S.prog.coins === before + 20, 'level paid after the restart: ' + A.S.prog.coins + ' vs ' + before);
    const again = A.S.prog.coins; A = restart(A, clock); ok(A.S.prog.coins === again, 'and only once');
  }
  // daily goal reached in the round before midnight, round finished after midnight
  {
    const clock = { t: day(2026, 11, 10, 23) };
    const A = fresh(clock, { goal: 100, days: { '2026-11-10': 97 }, lvl: 1 });
    A.startRound(ids, 'de-en', 10, { extras: false });
    for (let i = 0; i < 3; i++) { const q = A.S.quiz.list[A.S.quiz.i]; A.answerMC(q.options.indexOf(q.answer)); A.nextQ() }
    ok(A.S.prog.goalDay === '2026-11-10' && A.S.prog.goalDays === 1, 'goal booked with the answer that reached it');
    clock.t = day(2026, 11, 11, 0) + 5 * 60000;
    while (A.S.quiz) { const q = A.S.quiz.list[A.S.quiz.i]; A.answerMC(q.options.indexOf(q.answer)); A.nextQ() }
    ok(A.S.prog.goalDays === 1 && A.S.result.goalHit, 'kept over midnight and shown in the result');
    ok(A.S.result.coinSum >= 10, 'its coins are part of the sum shown: ' + A.S.result.coinSum);
  }
  // a Serien-Schutz bought after the loss does not bring the streak back
  {
    const clock = { t: day(2026, 11, 10) };
    const A = fresh(clock, { streak: 12, best: 12, last: '2026-11-07', coins: 100, freezes: 0 });
    ok(A.S.prog.streak === 0 && A.S.prog.best === 12, 'a lost streak is written down at the start');
    A.ACT['buy-freeze'](); ok(A.S.prog.freezes === 1 && A.streakInfo().n === 0, 'the protection is bought, the old streak stays lost');
    const B = fresh(clock, { streak: 12, best: 12, last: '2026-11-08', freezes: 1 });
    ok(B.S.prog.streak === 12 && B.streakInfo().frozen === 1, 'a protection that was there in time still saves the streak');
  }
  // damaged data: the app starts, a damaged backup is refused and nothing is saved
  {
    const clock = { t: day(2026, 11, 10) };
    const A = load({ clock, storage: { 'wordbox.units.v1': JSON.stringify([{ id: 'x', title: 'X', words: [null, { id: 'x-1', en: 'cat', de: 'Katze' }, 7] }, null, { id: 5 }]),
      'wordbox.prog.v1': JSON.stringify({ v: 1, econ: 2, tempo: 'fast', onboarded: true, v2: true, days: null, badges: 'kaputt', w: [1, 2], targets: {}, xp: 'viel', sel: 3, quests: { day: 'x' } }) } });
    const C = fresh(clock, { targets: [{ id: 't', ids: ['t1-01'], due: 5 }, { id: 'u', ids: ['t1-01'], due: '2026-11-20', title: 7 }], quests: { day: '2026-11-10', list: [['gibtsnicht', 3], 5, null], done: 4 }, today: { day: '2026-11-10' } });
    ok(C.S.prog.targets.length === 1 && C.S.prog.quests && C.S.prog.quests.list.every(x => C.QUESTS[x[0]]) && C.S.prog.today.right === 0, 'damaged targets, quests and day counters are replaced');
    ok(A.S.words.length === 1 && A.S.prog.xp === 0 && typeof A.S.prog.days === 'object' && Array.isArray(A.S.prog.targets), 'a damaged save starts with defaults for the broken parts');
    for (const v of ['home', 'practice', 'vocab', 'awards', 'shop', 'settings']) { try { A.S.view = v; A.render() } catch (e) { fails++; console.log('  FAIL damaged save, view', v, e.message) } }
    const B = fresh(clock, { xp: 500, coins: 7 }), keep = B.mem['wordbox.prog.v1'];
    B.S.restore = { date: 'x', data: { app: 'wordbox', v: 1, prog: { v: 1, econ: 2, xp: 900 }, units: [{ id: 'bad', title: 'Bad', get words() { throw new Error('boom') } }] } };
    B.ACT['restore-yes']();
    ok(B.S.prog.xp === 500 && B.mem['wordbox.prog.v1'] === keep, 'a backup that cannot be read changes nothing');
    B.S.restore = { date: 'x', data: { app: 'wordbox', v: 1, prog: { v: 1, econ: 2, tempo: 'fast', xp: 900, days: null, rounds: 30, badges: {} }, units: [{ id: 'u', title: 'U', words: [null, { id: 'u-1', en: 'dog', de: 'Hund' }] }] } };
    B.ACT['restore-yes']();
    ok(B.S.prog.xp === 900 && B.S.words.length === 1, 'a backup with small damage is repaired and loaded');
    ok(Object.keys(B.S.prog.badges).length > 0 && B.S.prog.coins === 5 * Object.keys(B.S.prog.badges).length, 'badges that come with the backup bring their coins: ' + B.S.prog.coins);
  }
  // all questions answered, then left through X: a finished round
  {
    const A = fresh({ t: day(2026, 11, 10) }, { lvl: 1 });
    A.startRound(ids, 'de-en', 10, { extras: false });
    while (true) { const Q = A.S.quiz, q = Q.list[Q.i]; A.answerMC(q.options.indexOf(q.answer)); if (Q.i === Q.list.length - 1) break; A.nextQ() }
    A.ACT['quit-yes']();
    ok(A.S.prog.rounds === 1 && A.S.prog.streak === 1 && A.S.prog.perfect === 1, 'counts as a round: rounds ' + A.S.prog.rounds + ', streak ' + A.S.prog.streak);
  }
  // a new word that is wrong first and right on the repeat counts for the quest
  {
    const A = fresh({ t: day(2026, 11, 10) }, { lvl: 1 });
    A.startRound(ids, 'de-en', 6, { extras: false });
    let first = true;
    while (A.S.quiz) { const q = A.S.quiz.list[A.S.quiz.i]; A.answerMC(first ? q.options.findIndex(o => o !== q.answer) : q.options.indexOf(q.answer)); first = false; A.nextQ() }
    ok(A.dayStats().fresh === 6, 'six new words learned, one of them on the second try: ' + A.dayStats().fresh);
  }
  // every combo quest fits into the shortest round; typed text is remembered
  ok(Math.max(...A0().QUESTS.combo.steps) <= 10, 'combo quest fits into a round of ten');
  function A0() { return fresh({ t: day(2026, 11, 10) }) }
  {
    const A = fresh({ t: day(2026, 11, 10) }, { lvl: 1 });
    A.startRound(ids, 'type', 5, { extras: false });
    A.S.view = 'quiz'; A.S.quiz.typed = 'half typed'; A.S.confirm = 'quit'; A.render();
    ok(/value="half typed"/.test(A.els.app.innerHTML), 'typed text is still in the field behind the quit dialog');
  }
  // a screen change does not wait for a painted frame, and never runs twice
  {
    let calls = 0, cb = null;
    const A = load({ clock: { t: day(2026, 11, 10) }, storage: { 'wordbox.units.v1': JSON.stringify(units) }, vt: f => { cb = f; return { ready: Promise.resolve(), finished: Promise.resolve() } } });
    A.timers.length = 0;
    A.transit(() => { calls++ }, 'push');
    ok(calls === 0, 'the browser decides when the change runs');
    A.timers.slice().forEach(f => f());
    ok(calls === 1, 'no frame: the watchdog changes the screen, calls ' + calls);
    cb(); ok(calls === 1, 'a late callback from the browser does not run it again');
  }
  console.log('T review fixes: done');
}
console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exitCode = fails ? 1 : 0;
