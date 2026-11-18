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

// ---- T5: quests have no deadline: they stay with their counts until done, done ones are replaced on a later day ----
{
  const clock = { t: day(2026, 11, 10) }; const A = fresh(clock); const seen = new Set();
  const first = JSON.stringify(A.questSlots().map(q => [q.id, q.need, q.tier]));
  A.questSlots().forEach((q, i) => ok(A.QUESTS[q.id] && A.QUESTS[q.id].lv[i] === q.need && q.tier === A.TIERS[i], 'place ' + i + ' holds ' + q.id + ' at its level'));
  ok(new Set(A.questSlots().map(q => q.id)).size === 3, 'three different quests');
  // five days without playing: nothing changes, nothing is lost
  A.track('right', 7); const kept = A.questSlots().map(q => JSON.stringify(q.stat));
  for (let d = 1; d <= 5; d++) { clock.t = day(2026, 11, 10 + d); ok(JSON.stringify(A.questSlots().map(q => [q.id, q.need, q.tier])) === first, 'day +' + d + ': the same quests wait') }
  ok(A.questSlots().every((q, i) => JSON.stringify(q.stat) === kept[i] && q.stat.right === 7), 'and so do their counts');
  // a restart keeps them too
  A.persist(); const A2 = load({ clock, storage: A.mem }); ok(JSON.stringify(A2.questSlots().map(q => [q.id, q.need, q.tier, q.stat.right])) === JSON.stringify(A.questSlots().map(q => [q.id, q.need, q.tier, q.stat.right])), 'quests survive a restart');
  // progress adds up over several days; a done quest stays ticked today and is replaced tomorrow
  const B = fresh({ t: day(2026, 11, 10) }); const q0 = B.questSlots()[0], id0 = q0.id;
  B.S.prog.quests.slots[0] = { id: 'right', need: 20, tier: 'COMMON', stat: {}, done: '' };
  B.clock.t = day(2026, 11, 10); B.track('right', 8); B.clock.t = day(2026, 11, 12); B.track('right', 8); ok(B.checkQuests().done.length === 0 && B.questSlots()[0].stat.right === 16, 'two days add up: 16 of 20');
  B.clock.t = day(2026, 11, 15); B.track('right', 4); const r = B.checkQuests();
  ok(r.done.indexOf('right') >= 0 && B.questSlots()[0].done === '2026-11-15' && B.S.prog.inv.some(c => c.source === 'DAILY_QUEST' && c.tier === 'COMMON'), 'done on the third day of trying, wooden chest in the bag');
  const inv = B.S.prog.inv.length; B.checkQuests(); ok(B.S.prog.inv.length === inv, 'a quest pays once');
  ok(B.questSlots()[0].id === 'right' && B.questSlots()[0].done, 'it stays ticked for the rest of the day');
  B.clock.t = day(2026, 11, 16); const nq = B.questSlots()[0]; ok(!nq.done && nq.id !== 'right' && Object.keys(nq.stat).length === 0, 'the next day a new quest takes its place: ' + nq.id);
  // a quest that cannot be finished any more makes room
  const C = fresh({ t: day(2026, 11, 10) }); C.S.prog.quests = { slots: [{ id: 'fresh', need: 5, tier: 'COMMON', stat: { fresh: 1 }, done: '' }], allDay: '' };
  C.S.words.forEach(w => { C.S.prog.w[w.id] = { l: 2, r: 1, x: 0, s: 0, d: 0 } });
  ok(C.questSlots()[0].id !== 'fresh', 'no new words left: the quest about new words is swapped');
  // over a month every kind turns up, and plain rounds can finish every quest
  const D = fresh({ t: day(2026, 11, 1) }); const all = D.S.words.map(w => w.id); let stuck = 0;
  for (let d = 0; d < 30; d++) { D.clock.t = day(2026, 11, 1 + d) + d * 86400000 * 0; D.clock.t = new Date(2026, 10, 1 + d, 16).getTime(); D.questSlots().forEach(q => seen.add(q.id)); play(D, all, 'mix'); play(D, all, 'type'); if (D.questSlots().some(q => !q.done)) stuck++ }
  console.log('T5 quest kinds over 30 days:', Array.from(seen).join(', '), '| days with an open quest left:', stuck, '| quests done', D.S.prog.questsDone);
  ok(D.S.prog.questsDone >= 45, 'two rounds a day finish most quests: ' + D.S.prog.questsDone);
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
  ok(R.xp === 3 && p.rounds === 0 && p.streak === 1, 'one-question round: xp ' + R.xp + ' rounds ' + p.rounds + ' streak ' + p.streak);
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
  ok(A.OUTFITS.every(o => A.SKINS[o.id] && o.cost > 0 && o.tier >= 1 && o.tier <= 4), 'every skin has colours, a price and a rarity');
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
  A.S.view = 'shop'; A.render(); ok(/Skins für Bit/.test(A.els.app.innerHTML) && A.els.app.innerHTML.indexOf('1 von ' + A.OUTFITS.length) > 0, 'shop shows the skins and the count');
  const saved = JSON.parse(A.mem['wordbox.prog.v1']); ok(saved.outfit === 'ninja' && saved.coins === afterFirst, 'skin and coins are saved');
  ok(A.OUTFITS.every((o, i) => !i || o.cost >= A.OUTFITS[i - 1].cost), 'skins are listed from cheap to dear');
  ok(new Set(A.OUTFITS.map(o => o.id)).size === A.OUTFITS.length && new Set(A.OUTFITS.map(o => o.t)).size === A.OUTFITS.length, 'skin ids and names are unique');
  // the shop hint comes once for players of the version before, never for new players
  const B = fresh({ t: day(2026, 11, 17) }, {}); ok(B.S.prog.shopSeen === B.OUTFITS.length, 'a player from 2.0 is told about the new skins once: ' + B.S.prog.shopSeen);
  const B2 = load({ clock: { t: day(2026, 11, 17) }, storage: B.mem }); ok(B2.S.prog.shopSeen === B2.OUTFITS.length, 'and it stays noted after a restart');
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
    ok(C.S.prog.targets.length === 1 && C.questSlots().length === 3 && C.questSlots().every(q => C.QUESTS[q.id]) && C.dayStats().right === 0, 'damaged targets, quests and day counters are replaced');
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
  ok(Math.max(...A0().QUESTS.combo.lv) <= 10, 'combo quest fits into a round of ten');
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
// ---- chests, loot, booster: nothing depends on the clock ----
{
  const ids = units[1].words.map(w => w.id), at = (h, m = 0, d = 18) => new Date(2026, 10, d, h, m, 0).getTime();
  const seq = (...v) => { let i = 0; return () => v[Math.min(i++, v.length - 1)] };
  // loot table: every tier stays inside its range, chances are what the table says
  {
    const A = fresh({ t: at(16) });
    for (const tier of A.TIERS) {
      const d = A.CHEST[tier]; let boosts = 0, freezes = 0, lo = 1e9, hi = 0; const N = 4000;
      for (let i = 0; i < N; i++) { const L = A.rollLoot(tier); lo = Math.min(lo, L.coins); hi = Math.max(hi, L.coins); if (L.boost) { boosts++; ok(L.boost.mult === d.boost[1] && L.boost.rounds === d.boost[2], 'booster of ' + tier) } if (L.freeze) freezes++ }
      ok(lo === d.coins[0] && hi === d.coins[1], tier + ' coins ' + lo + '–' + hi + ' fill the range ' + d.coins.join('–'));
      ok(Math.abs(boosts / N - d.boost[0]) < .04 && Math.abs(freezes / N - d.freeze) < .04, tier + ' chances: boost ' + (boosts / N).toFixed(2) + ' freeze ' + (freezes / N).toFixed(2));
    }
    ok(A.CHEST.COMMON.coins[1] < A.CHEST.RARE.coins[0] && A.CHEST.RARE.coins[1] < A.CHEST.EPIC.coins[0] && A.CHEST.EPIC.coins[1] < A.CHEST.MEGA.coins[0], 'a better chest always pays more');
  }
  // three taps: upgrades on tap 1 and 2 only, saved at once, tap 3 pays exactly what was rolled
  {
    const A = fresh({ t: at(16) }, { coins: 0 });
    const c = A.addChest('COMMON', 'DAILY_QUEST');
    let r = A.tapChest(c.id, seq(.1)); ok(r && !r.open && r.up && r.tier === 'RARE', 'tap 1 with luck lifts the chest: ' + JSON.stringify(r));
    ok(JSON.parse(A.mem['wordbox.prog.v1']).inv[0].tier === 'RARE' && JSON.parse(A.mem['wordbox.prog.v1']).inv[0].taps === 1, 'the tap is saved');
    const B = load({ clock: { t: at(16) }, storage: A.mem });
    r = B.tapChest(c.id, seq(.9)); ok(r && !r.up && r.tier === 'RARE' && r.taps === 2, 'after a restart the chest goes on at tap 2, no second first roll');
    r = B.tapChest(c.id, seq(0, .99, .99)); ok(r.open && r.loot.coins === B.CHEST.RARE.coins[0] && !r.loot.boost && !r.loot.freeze, 'tap 3 opens: ' + JSON.stringify(r.loot));
    ok(B.S.prog.coins === B.CHEST.RARE.coins[0] && !B.S.prog.inv.length && B.S.prog.chestsOpened === 1, 'coins paid, chest gone');
    ok(B.tapChest(c.id) === null, 'an opened chest cannot be tapped again');
    const M = B.addChest('MEGA', 'STREAK'); r = B.tapChest(M.id, seq(0)); ok(!r.up && r.tier === 'MEGA', 'nothing above a diamond chest');
  }
  // Serien-Schutz from a chest: at most two in the bag, otherwise coins instead
  {
    const A = fresh({ t: at(16) }, { coins: 0, freezes: 1 });
    A.applyLoot({ coins: 5, boost: null, freeze: true, freezeCoins: 0 }); ok(A.S.prog.freezes === 2 && A.S.prog.coins === 5, 'second protection goes into the bag');
    const L = { coins: 5, boost: null, freeze: true, freezeCoins: 0 }; A.applyLoot(L); ok(A.S.prog.freezes === 2 && L.freezeCoins === 12 && A.S.prog.coins === 22, 'bag full: coins instead, ' + A.S.prog.coins);
  }
  // booster: counts rounds, not minutes. It waits for weeks if it has to and is used up by rounds only.
  {
    const clock = { t: at(16) }; const A = fresh(clock, { lvl: 1 });
    ok(A.xpMult() === 1, 'no booster at first');
    A.addBoost(1.5, 1); A.addBoost(2, 2); ok(A.S.prog.boost.mult === 2 && A.S.prog.boost.rounds === 3, 'two boosters: higher factor, rounds added');
    clock.t += 21 * 86400000; ok(A.xpMult() === 2 && A.S.prog.boost.rounds === 3, 'three weeks later it is still there');
    const xp0 = A.S.prog.xp; A.startRound(ids, 'de-en', 10, { extras: false });
    const q = A.S.quiz.list[0]; A.answerMC(q.options.indexOf(q.answer)); ok(A.S.prog.xp - xp0 === 6 && A.S.quiz.gain === 6 && A.S.quiz.boostXP === 3, 'a right answer counts double: ' + (A.S.prog.xp - xp0));
    while (A.S.quiz) { A.nextQ(); if (!A.S.quiz) break; const x = A.S.quiz.list[A.S.quiz.i]; A.answerMC(x.options.indexOf(x.answer)) }
    const R = A.S.result, plain = R.extras.filter(e => e[0] !== 'XP-Booster').reduce((a, e) => a + e[1], 0) + 30;
    ok(R.extras.some(e => e[0] === 'XP-Booster') && R.xp === 2 * plain, 'the round shows the booster share: ' + R.xp + ' = 2 x ' + plain);
    ok(A.S.prog.boost.rounds === 2, 'one round used, two left');
    A.startRound(ids, 'de-en', 10, { extras: false }); A.finish(true); ok(A.S.prog.boost.rounds === 2, 'a round left before the first answer uses nothing');
    play(A, ids, 'de-en'); play(A, ids, 'de-en'); ok(A.S.prog.boost === null && A.xpMult() === 1, 'used up after three rounds');
    const xp1 = A.S.prog.xp; A.startRound(ids, 'de-en', 10, { extras: false }); const y = A.S.quiz.list[0]; A.answerMC(y.options.indexOf(y.answer)); ok(A.S.prog.xp - xp1 === 3, 'then XP count once again');
  }
  // the first finished round of a day brings a silver chest, at any hour; no chest ever locks or expires
  {
    for (const h of [7, 15, 19]) {
      const clock = { t: at(h, 20) }; const A = fresh(clock, { lvl: 1 });
      const R = play(A, ids, 'de-en'), dc = A.S.prog.inv.filter(c => c.source === 'DAILY');
      ok(dc.length === 1 && dc[0].tier === 'RARE' && dc[0].status === 'READY' && R.chests.indexOf(dc[0]) >= 0, 'first round at ' + h + ' h brings the chest of the day');
      play(A, ids, 'de-en'); ok(A.S.prog.inv.filter(c => c.source === 'DAILY').length === 1, 'one per day');
      ok(A.S.prog.inv.every(c => c.status === 'READY' && !('unlockWindowStart' in c) && !('unlockWindowEnd' in c)), 'no chest has opening hours');
      clock.t += 40 * 86400000; A.persist(); const B = load({ clock, storage: A.mem });
      ok(B.S.prog.inv.length === A.S.prog.inv.length && B.tapChest(dc[0].id).taps === 1, 'forty days later every chest is still there and opens');
    }
  }
  // triggers: every fifth round, level-up, streak milestones
  {
    const clock = { t: at(14) }; const A = fresh(clock, { lvl: 1, rounds: 3, xp: 0 });
    const src = s => A.S.prog.inv.filter(c => c.source === s);
    let R = play(A, ids, 'de-en'); ok(src('PATH_MILESTONE').length === 0, 'round 4: no milestone chest');
    R = play(A, ids, 'de-en'); ok(A.S.prog.rounds === 5 && src('PATH_MILESTONE').length === 1 && src('PATH_MILESTONE')[0].tier === 'COMMON' && R.steps.indexOf('chests') >= 0, 'round 5: wooden chest, shown in the result');
    ok(src('LEVEL_UP').length === A.S.prog.lvl - 1 && src('LEVEL_UP').every(c => c.tier === 'RARE'), 'one silver chest per level gained: ' + src('LEVEL_UP').length + ' for level ' + A.S.prog.lvl);
    for (const [n, tier] of [[3, 'COMMON'], [7, 'RARE'], [14, 'RARE'], [30, 'EPIC'], [50, 'EPIC'], [100, 'MEGA']]) {
      const B = fresh({ t: at(14) }, { lvl: 1, streak: n - 1, best: n - 1, last: '2026-11-17' });
      play(B, ids, 'de-en'); const sc = B.S.prog.inv.filter(c => c.source === 'STREAK');
      ok(B.S.prog.streak === n && sc.length === 1 && sc[0].tier === tier, 'day ' + n + ' of the streak brings ' + tier);
      play(B, ids, 'de-en'); ok(B.S.prog.inv.filter(c => c.source === 'STREAK').length === 1, 'once only');
    }
  }
  // saves from 2.2: locked chests open up, a booster in minutes becomes rounds, the day's quests come along
  {
    const now = at(16);
    const old = { v: 1, econ: 2, tempo: 'fast', onboarded: true, v2: true, news: '2.2', xp: 300, coins: 40, lvl: 3, days: { '2026-11-18': 30 },
      inv: [{ id: 'a', tier: 'RARE', source: 'EARLY_BIRD', status: 'LOCKED', createdAt: now, taps: 0, unlockWindowStart: now + 7200000, unlockWindowEnd: now + 9e6 }, { id: 'b', tier: 'EPIC', source: 'DAILY_QUEST', status: 'READY', createdAt: now, taps: 1 }],
      boost: { mult: 2, left: 14 * 60000, at: now }, clock: now + 9e9, tcEarly: '2026-11-18',
      today: { day: '2026-11-18', right: 12, rounds: 1, perfect: 0, typed: 0, past: 0, up: 3, fresh: 2, combo: 6 },
      quests: { day: '2026-11-18', list: [['xp', 40, 'COMMON'], ['right', 30, 'RARE'], ['rounds', 3, 'EPIC']], done: { xp: true }, chest: false } };
    const A = load({ clock: { t: now }, storage: { 'wordbox.units.v1': JSON.stringify(units), 'wordbox.prog.v1': JSON.stringify(old) } });
    ok(A.S.prog.inv.length === 2 && A.S.prog.inv.every(c => c.status === 'READY' && !('unlockWindowStart' in c)) && A.S.prog.inv[1].taps === 1, 'chests with opening hours are simply chests now');
    ok(A.tapChest('a').taps === 1, 'the former early-bird chest opens right away');
    ok(A.S.prog.boost && A.S.prog.boost.mult === 2 && A.S.prog.boost.rounds === 1 && !('left' in A.S.prog.boost), 'fourteen minutes of booster become one round');
    const sl = A.questSlots(); ok(sl[0].id === 'xp' && sl[0].done === '2026-11-18' && sl[1].id === 'right' && sl[1].stat.right === 12 && sl[2].id === 'rounds' && sl[2].stat.rounds === 1, 'the quests of the day come along with their counts: ' + JSON.stringify(sl.map(q => [q.id, q.done, q.stat.right, q.stat.rounds])));
    const B = fresh({ t: now }, { inv: [{ id: 'a', tier: 'EPIC', status: 'READY', source: 'STREAK' }, null, { id: 5, tier: 'RARE', status: 'READY' }, { id: 'b', tier: 'BESSER', status: 'READY' }, { id: 'c', tier: 'RARE', status: 'OPENED' }], boost: { mult: 'x' }, quests: { slots: [{ id: 'xp' }, 7] } });
    ok(B.S.prog.inv.length === 1 && B.S.prog.inv[0].id === 'a' && B.S.prog.boost === null && B.questSlots().length === 3 && B.questSlots().every(q => B.QUESTS[q.id]), 'a damaged bag, booster or quest list is repaired');
    for (const v of ['home', 'awards', 'shop']) { try { A.S.view = v; A.render(); if (/NaN|undefined|Uhr|verf[aä]ll/.test(A.els.app.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g, ''))) { fails++; console.log('  FAIL clock words or NaN in', v) } } catch (e) { fails++; console.log('  FAIL view with chests', v, e.message) } }
  }
  console.log('T chests: done');
}

// ---- 2.4: steady XP instead of lucky XP. One XP more per right answer, a flatter level curve from level 10, small boosters ----
{
  const at = (h, d = 18) => new Date(2026, 10, d, h, 0, 0).getTime();
  const ids = units[1].words.map(w => w.id);
  // level curve
  {
    const A = fresh({ t: at(16) }), old = n => 50 * (n - 1) + 25 * n * (n - 1), cost = n => A.lvlStart(n + 1) - A.lvlStart(n);
    for (let n = 1; n <= 11; n++) ok(A.lvlStart(n) === old(n), 'up to level 11 nothing changes: level ' + n + ' starts at ' + A.lvlStart(n));
    for (let n = 12; n <= 80; n++) ok(A.lvlStart(n) < old(n) && Number.isInteger(A.lvlStart(n)) && cost(n) > cost(n - 1), 'level ' + n + ': ' + A.lvlStart(n) + ' (old ' + old(n) + '), step ' + cost(n));
    ok(cost(9) === 500 && cost(10) === 550 && cost(11) === 575 && cost(15) === 675 && cost(20) === 800, 'steps: ' + [9, 10, 11, 15, 20].map(cost).join(', '));
    const oldLevel = xp => { let n = 1; while (old(n + 1) <= xp) n++; return n };
    let lost = 0; for (let xp = 0; xp <= 80000; xp += 7) if (A.levelInfo(xp).n < oldLevel(xp)) lost++;
    ok(lost === 0, 'nobody loses a level through the new curve: ' + lost);
    const L = A.levelInfo(A.lvlStart(15) + 100); ok(L.n === 15 && L.into === 100 && L.span === 675 && L.left === 575, 'levelInfo on the new curve: ' + JSON.stringify(L));
  }
  // a level that the new curve hands out is paid once at the start: 20 coins and a silver chest
  {
    // old curve: level 15 (5950–6750), new: level 16 from 6375. The control save has the level paid already; both get the same coins for badges.
    const xp = 6400, K = fresh({ t: at(16) }, { xp, lvl: 16, coins: 0, news: '2.3' }), base = K.S.prog.coins;
    ok(!K.S.prog.inv.length, 'control: no chest without a new level');
    const A = fresh({ t: at(16) }, { xp, lvl: 15, coins: 0, news: '2.3' }), p = A.S.prog;
    ok(A.levelInfo(xp).n === 16 && p.lvl === 16 && p.coins === base + 20 && p.inv.length === 1 && p.inv[0].tier === 'RARE' && p.inv[0].source === 'LEVEL_UP', 'owed level paid at start: ' + JSON.stringify([p.lvl, p.coins - base, p.inv.map(c => c.tier)]));
    A.timers.slice().forEach(f => f()); ok(/Neu:/.test(A.els.toast.innerHTML) && /Level 16/.test(A.els.toast.innerHTML), 'the note after the update names the new level: ' + A.els.toast.innerHTML.replace(/<[^>]+>/g, ''));
    K.timers.slice().forEach(f => f()); ok(/Neu:/.test(K.els.toast.innerHTML) && !/Level/.test(K.els.toast.innerHTML), 'without a new level only the news line');
    const B = load({ clock: { t: at(17) }, storage: A.mem }); ok(B.S.prog.lvl === 16 && B.S.prog.coins === base + 20 && B.S.prog.inv.length === 1, 'and not a second time');
    const C = fresh({ t: at(16) }, { xp: 3400, lvl: 11, coins: 0, news: '2.3' }); ok(C.S.prog.lvl === 11 && !C.S.prog.inv.length, 'level 11 stays level 11');
  }
  // XP of one answer: 3, typed 4, the 5-combo adds 2 as before
  {
    const A = fresh({ t: at(16) }, { lvl: 1 });
    A.startRound(ids, 'de-en', 10, { extras: false }); const got = [];
    while (A.S.quiz) { const q = A.S.quiz.list[A.S.quiz.i], x0 = A.S.prog.xp; A.answerMC(q.options.indexOf(q.answer)); got.push(A.S.prog.xp - x0); A.nextQ() }
    ok(got.join() === '3,3,3,3,5,3,3,3,3,5', 'multiple choice: ' + got.join());
    A.startRound(ids, 'type', 10, { extras: false }); const x0 = A.S.prog.xp; A.settle(true, false); ok(A.S.prog.xp - x0 === 4, 'typed: ' + (A.S.prog.xp - x0));
    A.settle(false, false); A.finish(true);
    const B = fresh({ t: at(16) }, { lvl: 1 }); B.startRound(ids, 'de-en', 10, { extras: false });
    const q = B.S.quiz.list[0], y0 = B.S.prog.xp; B.answerMC(q.options.findIndex(o => o !== q.answer)); ok(B.S.prog.xp === y0, 'a wrong answer still gives nothing');
  }
  // boosters: no booster in a wooden chest, 1,5x in silver and gold, 2x for one round in a diamond chest
  {
    const A = fresh({ t: at(16) }, { lvl: 1 }), b = t => A.CHEST[t].boost;
    ok(b('COMMON')[0] === 0 && b('RARE')[1] === 1.5 && b('EPIC')[1] === 1.5 && b('MEGA').join() === '1,2,1' && b('RARE')[0] < b('EPIC')[0] && b('EPIC')[0] <= .2, 'booster table: ' + JSON.stringify(A.TIERS.map(b)));
    for (let i = 0; i < 500; i++) ok(!A.rollLoot('COMMON').boost, 'a wooden chest holds no booster');
    A.addBoost(1.5, 1); A.startRound(ids, 'de-en', 10, { extras: false });
    const q = A.S.quiz.list[0], x0 = A.S.prog.xp; A.answerMC(q.options.indexOf(q.answer)); ok(A.S.prog.xp - x0 === 5 && A.S.quiz.boostXP === 2, '1,5x on 3 XP gives 5: ' + (A.S.prog.xp - x0));
    while (A.S.quiz) { A.nextQ(); if (!A.S.quiz) break; const x = A.S.quiz.list[A.S.quiz.i]; A.answerMC(x.options.indexOf(x.answer)) }
    ok(A.S.prog.boost === null, 'used up after its round');
    A.S.view = 'home'; A.S.result = null; A.addBoost(1.5, 1); A.render(); ok(/1,5x XP/.test(A.els.app.innerHTML), 'the start page says 1,5x with a comma');
    // a booster won before the update keeps its factor and its rounds
    const B = fresh({ t: at(16) }, { lvl: 1, boost: { mult: 3, rounds: 2 }, news: '2.3' }); ok(B.xpMult() === 3 && B.S.prog.boost.rounds === 2, 'an old 3x booster is kept');
  }
  console.log('T 2.4 steady XP: done');
}
// ---- 2.5: a lesson as a file for friends, the Android back button, the hint to install ----
{
  const at = (h, d = 18) => new Date(2026, 10, d, h, 0, 0).getTime();
  const store = (us, extra) => ({ 'wordbox.units.v1': JSON.stringify(us), 'wordbox.prog.v1': JSON.stringify(Object.assign({ v: 1, econ: 2, tempo: 'fast', onboarded: true, v2: true, sound: false, speak: false, goal: 150, lvl: 1 }, extra || {})) });
  const PHONE = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
  const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
  const tab = q => /reduced-motion/.test(q);      // a browser tab: not installed; motion reduced as in the other tests
  // the lesson file: every word arrives, with page and section, and nothing but words travels
  {
    const A = fresh({ t: at(16) });
    for (const u of A.S.units) {
      const text = A.unitFile(u), res = A.parseText(text), f = JSON.parse(text.slice(text.indexOf('{')));
      ok(res && res.data && res.data.title === u.title && res.data.app !== 'wordbox', u.title + ': title travels and the file is no backup');
      ok(res.words.length === u.words.length, u.title + ': ' + res.words.length + ' of ' + u.words.length + ' words arrive');
      ok(!/"id"|"l":|"xp"|"name"/.test(text) && Object.keys(f).join() === 'type,title,pages,words', u.title + ': only words in the file, keys ' + Object.keys(f).join());
      const same = u.words.every((w, i) => ['en', 'de', 'ipa', 'ex', 'sec', 'page'].every(k => String(w[k] || '') === String(res.words[i][k] || '')) && (w.pos !== 'verb' || String(w.past || '') === res.words[i].past));
      ok(same, u.title + ': en, de, ipa, example, section, page and simple past unchanged');
    }
    // the file starts with a few lines for the friend who taps it in a chat; the data still reads
    {
      const text = A.unitFile(A.S.units[1]), head = text.slice(0, text.indexOf('{'));
      ok(/^Voc a Bit – Lektion: Theme 2: Celebrations \(152 Wörter\)\n/.test(head) && /So öffnest du sie:/.test(head) && /Datei öffnen/.test(head) && !/https?:/.test(head), 'the file says what to do: ' + head.split('\n')[0]);
      const odd = { title: 'Meine {Liste} [1]', pages: '', words: [{ en: 'plane', de: 'Flugzeug' }, { en: 'to choose', de: '(aus)wählen', pos: 'verb', past: 'chose' }] };
      const t2 = A.unitFile(odd), h2 = t2.slice(0, t2.indexOf('\n\n')), r2 = A.parseText(t2);
      ok(!/[{}\[\]]/.test(h2) && r2.data.title === odd.title && r2.words.length === 2 && r2.words[1].past === 'chose', 'braces in a title cannot break the file: ' + h2.split('\n')[0]);
      const W = load({ clock: { t: at(16) }, storage: store(units), loc: { protocol: 'https:', origin: 'https://example.org', pathname: '/app/' } });
      const t3 = W.unitFile(W.S.units[0]); ok(/Du hast die App noch nicht\? https:\/\/example\.org\/app\/\n/.test(t3) && W.parseText(t3).words.length === W.S.units[0].words.length, 'on the web the file names the address of the app');
    }
    ok(A.unitFileName({ title: 'Theme 2: Celebrations / "Party"?' }) === 'Voc a Bit - Theme 2 Celebrations Party.txt', 'file name: ' + A.unitFileName({ title: 'Theme 2: Celebrations / "Party"?' }));
    ok(A.unitFileName({ title: 'Übung für März' }) === 'Voc a Bit - Übung für März.txt' && A.unitFileName({ title: '///' }) === 'Voc a Bit - Lektion.txt' && A.unitFileName({}) === 'Voc a Bit - Lektion.txt', 'file name keeps umlauts and never is empty');
  }
  // a friend who does not have the lesson opens the file: review, save, and the learning path has its stations
  {
    const A = fresh({ t: at(16) }), text = A.unitFile(A.S.units[1]);
    const B = load({ clock: { t: at(16) }, storage: store([units[0]]) });
    B.S.imp = { step: 'pick', text: '', title: '', words: [], err: '', showPrompt: false }; B.S.view = 'import';
    B.startReview(B.parseText(text), 'Voc a Bit - Theme 2 Celebrations');
    ok(B.S.imp.step === 'review' && B.S.imp.title === units[1].title && B.S.imp.words.filter(w => w.on).length > 140, 'review shows the lesson: ' + B.S.imp.title + ', ' + B.S.imp.words.filter(w => w.on).length + ' chosen');
    const chosen = B.S.imp.words.filter(w => w.on).length; B.saveImport();
    const got = B.S.units[B.S.units.length - 1];
    ok(B.S.units.length === 2 && got.title === units[1].title && got.words.length === chosen && got.words.every(w => w.id && w.en && w.de), 'saved as a lesson of its own with ' + got.words.length + ' words');
    ok(B.pathNodes(got).length === A.pathNodes(A.S.units[1]).length, 'same stations on the learning path: ' + B.pathNodes(got).length);
    // a friend who has the lesson already gets nothing twice
    const C = fresh({ t: at(16) }); C.S.imp = { step: 'pick', text: '', title: '', words: [], err: '', showPrompt: false }; C.startReview(C.parseText(text));
    ok(C.S.imp.words.every(w => w.dup && !w.on), 'known words are marked and not chosen');
  }
  // the share button hands a text file to the share sheet; where the system refuses, the file is saved instead
  {
    let shared = null;
    const A = load({ clock: { t: at(16) }, storage: store(units), nav: { canShare: d => d.files[0].type === 'text/plain', share: d => { shared = d; return Promise.resolve() } } });
    A.S.view = 'vocab'; A.S.openUnit = units[1].id; A.render();
    ok(/data-act="unit-share"/.test(A.els.app.innerHTML) && />Teilen</.test(A.els.app.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '')), 'every lesson has a share button');
    A.ACT['unit-share']({ dataset: { u: units[1].id } });
    const sheet = A.els.app.innerHTML;
    ok(shared === null && A.S.sheet && A.S.sheet.type === 'share' && /Lektion teilen/.test(sheet) && (sheet.match(/<li>/g) || []).length === 3 && /data-act="unit-send"/.test(sheet) && /nicht dein Lernstand/.test(sheet), 'the share button first shows three steps');
    ok(/Theme 2: Celebrations · 152 Wörter/.test(sheet), 'the sheet names the lesson');
    A.ACT['unit-send']({ dataset: { u: units[1].id } });
    ok(A.S.sheet === null && !/Lektion teilen/.test(A.els.app.innerHTML), 'sending closes the sheet');
    ok(shared && shared.files.length === 1 && shared.files[0].type === 'text/plain' && /^Voc a Bit - .*\.txt$/.test(shared.files[0].name), 'a .txt goes to the share sheet: ' + (shared && shared.files[0].name));
    const B = load({ clock: { t: at(16) }, storage: store(units), nav: { canShare: () => false, share: () => { throw new Error('must not be called') } } });
    B.created.length = 0; B.ACT['unit-share']({ dataset: { u: units[1].id } }); ok(!B.created.some(e => e.download), 'the how-to alone saves nothing'); B.ACT['unit-send']({ dataset: { u: units[1].id } });
    ok(B.created.some(e => /^Voc a Bit - .*\.txt$/.test(e.download || '')), 'no share sheet for files: saved as a download');
    const C = load({ clock: { t: at(16) }, storage: store(units) }); C.created.length = 0; C.ACT['unit-share']({ dataset: { u: 'gibt-es-nicht' } }); ok(C.S.sheet === null, 'no sheet for an unknown lesson'); C.ACT['unit-send']({ dataset: { u: 'gibt-es-nicht' } });
    ok(!C.created.some(e => e.download), 'an unknown lesson shares nothing');
  }
  // Android back button: one step back inside the app, and out of the app only from the start page
  {
    const ids = units[1].words.map(w => w.id);
    const A = load({ clock: { t: at(16) }, storage: store(units), ua: PHONE });
    ok(A.ANDROID && !A.IOS && A.hist.stack.length === 2 && A.hist.i === 1 && A.hist.stack[1].vab === 1, 'the guard is there after the start: ' + JSON.stringify(A.hist));
    const guard = () => A.hist.i === 1 && A.hist.stack.length === 2;
    A.go('vocab'); ok(A.back() && A.S.view === 'home' && guard(), 'a tab: back to the start page');
    A.go('settings'); A.back(); ok(A.S.view === 'awards' && guard(), 'settings: back to Erfolge'); A.back(); ok(A.S.view === 'home', 'then to the start page');
    A.S.sheet = { type: 'badge', id: 'first' }; A.S.view = 'awards'; A.render(); A.back(); ok(A.S.sheet === null && A.S.view === 'awards' && guard(), 'an open sheet closes first');
A.S.view = 'vocab'; A.ACT['unit-share']({ dataset: { u: units[1].id } }); ok(A.S.sheet && A.S.sheet.type === 'share', 'how-to open'); A.back(); ok(A.S.sheet === null && A.S.view === 'vocab' && guard(), 'back closes the how-to for sharing');
    const c = A.addChest('COMMON', 'DAILY_QUEST'); A.S.view = 'home'; A.ACT['chest-open']({ dataset: { c: c.id } }); ok(A.S.chest, 'chest dialog open'); A.back(); ok(A.S.chest === null && A.S.prog.inv.length === 1, 'a chest dialog closes, the chest stays in the bag');
    A.startRound(ids, 'de-en', 10, { extras: false }); A.back(); ok(A.S.quiz === null && A.S.view === 'home', 'a round without an answer just ends');
    A.startRound(ids, 'de-en', 10, { extras: false }); const q = A.S.quiz.list[0]; A.answerMC(q.options.indexOf(q.answer));
    A.back(); ok(A.S.quiz && A.S.confirm === 'quit' && guard(), 'a round with answers asks first');
    A.back(); ok(A.S.quiz && A.S.confirm === null && A.S.view === 'quiz', 'back again closes the question and the round goes on');
    while (A.S.quiz) { A.nextQ(); if (!A.S.quiz) break; const x = A.S.quiz.list[A.S.quiz.i]; A.answerMC(x.options.indexOf(x.answer)) }
    ok(A.S.view === 'result' && A.S.result, 'round finished'); const xp = A.S.prog.xp; A.back(); ok(A.S.view === 'home' && A.S.result === null && A.S.prog.xp === xp, 'the result closes, nothing is lost');
    A.ACT['imp-open'](); A.S.imp.text = 'plane ; Flugzeug\nsuddenly ; plötzlich'; A.ACT['imp-parse'](); ok(A.S.imp.step === 'review', 'import at the review');
    A.back(); ok(A.S.view === 'import' && A.S.imp.step === 'pick', 'review: back to the input'); A.back(); ok(A.S.view === 'vocab' && A.S.imp === null, 'input: back to Vokabeln');
    A.back(); ok(A.S.view === 'home' && guard(), 'and home');
    // on the start page nothing is left to close: a note, no new guard, the next back leaves the app
    A.els.toast.innerHTML = ''; ok(A.back() === true && /Noch einmal/.test(A.els.toast.innerHTML) && A.hist.i === 0, 'start page: the note appears');
    A.render(); ok(A.hist.i === 0 && A.back() === false, 'a render in the background does not hold the app: the second back leaves');
    A.fire('click', {}, 'document'); A.render(); ok(guard(), 'a tap brings the guard back');
    // started again on the guard entry (update, reload): no second guard
    const R = load({ clock: { t: at(16) }, storage: store(units), ua: PHONE, history: { state: { vab: 1 } } }); ok(R.hist.pushes === 0, 'reload on the guard: nothing is added');
    // the iPhone and the desktop get no history entry at all
    const I = load({ clock: { t: at(16) }, storage: store(units), ua: IPHONE }); I.go('vocab'); I.go('home'); ok(I.IOS && !I.ANDROID && I.hist.pushes === 0, 'iPhone: history untouched');
    const D = load({ clock: { t: at(16) }, storage: store(units) }); D.go('vocab'); ok(D.hist.pushes === 0, 'desktop: history untouched');
    // before the welcome screens are done, back is not answered
    const N = load({ clock: { t: at(16) }, storage: { 'wordbox.units.v1': JSON.stringify(units) }, ua: PHONE }); ok(N.backStep() === false, 'welcome screens: back may leave');
  }
  // the hint to install shows in a browser tab only, and in the words of the system
  {
    const home = A => { A.S.view = 'home'; A.render(); return A.els.app.innerHTML };
    const P = load({ clock: { t: at(16) }, storage: store(units), ua: IPHONE, media: tab, nav: { standalone: false } });
    ok(!P.STANDALONE && /Zum Home-Bildschirm/.test(home(P)), 'iPhone in Safari: the way to the home screen is explained');
    P.ACT['install-later'](); ok(!/Zum Home-Bildschirm/.test(home(P)), '"Später" puts the hint away');
    const H = load({ clock: { t: at(16) }, storage: store(units), ua: IPHONE, media: tab, nav: { standalone: true } });
    ok(H.STANDALONE && !/class="card install"/.test(home(H)), 'iPhone app on the home screen: no hint');
    const G = load({ clock: { t: at(16) }, storage: store(units), ua: PHONE, media: tab });
    ok(!/class="card install"/.test(home(G)), 'Android before Chrome offers to install: no hint');
    let prompted = 0, stopped = 0; G.fire('beforeinstallprompt', { preventDefault() { stopped++ }, prompt() { prompted++ } });
    ok(stopped === 1 && /Als App installieren/.test(home(G)) && /data-act="install"/.test(home(G)), 'Android: a button to install');
    G.ACT.install(); ok(prompted === 1 && !/class="card install"/.test(home(G)), 'the button asks Chrome once and the hint is gone');
    const W = load({ clock: { t: at(16) }, storage: store(units), ua: PHONE, media: q => /reduced-motion|standalone/.test(q) }); W.fire('beforeinstallprompt', { preventDefault() {}, prompt() {} });
    ok(W.STANDALONE && !/class="card install"/.test(home(W)), 'installed Android app: no hint');
    // the words about sound name the mute switch on the iPhone only
    const set = A => { A.S.view = 'settings'; A.render(); return A.els.app.innerHTML };
const imp = A => { A.ACT['imp-open'](); const h = A.els.app.innerHTML; A.ACT['imp-back'](); return h };
    ok(/Lektion von einem Freund\?/.test(imp(P)) && /In Dateien sichern/.test(imp(P)) && (imp(P).match(/<li>/g) || []).length === 3, 'import page: three steps for a file from a friend, iPhone wording');
    ok(/Lektion von einem Freund\?/.test(imp(G)) && !/In Dateien sichern/.test(imp(G)) && /geladen wird/.test(imp(G)), 'import page on Android: no words about the Files app');
    ok(/Stummschalter/.test(set(P)) && /iOS 18/.test(set(P)) && !/Stummschalter|iOS 18|iPhone/.test(set(G)), 'settings: mute switch and iOS only on the iPhone');
  }
  // one system at a time: an iPad calls itself a Mac with a touch screen, an Android phone never counts as one
  {
    const pad = load({ clock: { t: at(16) }, storage: store(units), ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15', nav: { platform: 'MacIntel', maxTouchPoints: 5 } });
    const mac = load({ clock: { t: at(16) }, storage: store(units), ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15', nav: { platform: 'MacIntel', maxTouchPoints: 0 } });
    const odd = load({ clock: { t: at(16) }, storage: store(units), ua: PHONE, nav: { platform: 'MacIntel', maxTouchPoints: 5 } });
    ok(pad.IOS && !pad.ANDROID && !mac.IOS && !mac.ANDROID && odd.ANDROID && !odd.IOS, 'iPad yes, Mac no, Android never both: ' + [pad.IOS, mac.IOS, odd.IOS, odd.ANDROID].join());
  }
  console.log('T 2.5 share, back button, install: done');
}
// ---- 90 days of play with a fixed dice: the books always balance ----
{
  let seed = 20261118; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff };
  const clock = { t: new Date(2026, 10, 18, 7, 0, 0).getTime() }; let A = fresh(clock, { lvl: 1, coins: 0 });
  const all = A.S.words.map(w => w.id); let rounds = 0, opened = 0, coinsFromChests = 0, maxInv = 0, boostedRounds = 0, bad = [];
  const note = m => { if (bad.length < 6) bad.push(m) };
  for (let d = 0; d < 90; d++) {
    const dayStart = new Date(2026, 10, 18 + d, 0, 0, 0).getTime();
    if (rnd() < .12) continue;                                                     // a day off now and then
    for (const h of [7, 15, 19].filter(() => rnd() < .6)) {
      clock.t = dayStart + h * 3600000 + Math.floor(rnd() * 3000000);
      if (rnd() < .3) A = load({ clock, storage: A.mem });                          // the app was closed in between
      const acc = .5 + rnd() * .5, c0 = A.S.prog.coins, quit = rnd() < .1;
      A.startRound(all, ['mix', 'de-en', 'type'][Math.floor(rnd() * 3)], 10);
      if (!A.S.quiz) continue;
      if (A.S.quiz.mult > 1) boostedRounds++;
      let n = 0;
      while (A.S.quiz) {
        const q = A.S.quiz.list[A.S.quiz.i], right = rnd() < acc;
        if (q.type === 'type') A.settle(right, false); else A.answerMC(right ? q.options.indexOf(q.answer) : q.options.findIndex(o => o !== q.answer));
        if (quit && ++n >= 4) { A.finish(true); break }
        A.nextQ();
      }
      rounds++;
      if (A.S.result && A.S.result.coinSum !== A.S.prog.coins - c0) note('day ' + d + ': coin sum ' + A.S.result.coinSum + ' but wallet +' + (A.S.prog.coins - c0));
      // open some of the chests
      for (const c of A.S.prog.inv.slice()) if (rnd() < .8) { const before = A.S.prog.coins; let r; do { r = A.tapChest(c.id, rnd) } while (r && !r.open); if (r) { opened++; coinsFromChests += A.S.prog.coins - before; if (A.S.prog.coins - before !== r.loot.coins + r.loot.freezeCoins) note('chest paid ' + (A.S.prog.coins - before) + ' but showed ' + JSON.stringify(r.loot)) } }
      const p = A.S.prog; maxInv = Math.max(maxInv, p.inv.length);
      if (!(p.coins >= 0) || !(p.freezes >= 0 && p.freezes <= 2) || !Number.isFinite(p.xp) || (p.boost && !(p.boost.rounds > 0))) note('day ' + d + ': state off ' + JSON.stringify([p.coins, p.freezes, p.xp, p.boost]));
      if (p.inv.some(c => A.TIERS.indexOf(c.tier) < 0 || !c.id || c.status !== 'READY' || 'unlockWindowEnd' in c)) note('day ' + d + ': odd chest in the bag');
      if (new Set(p.inv.map(c => c.id)).size !== p.inv.length) note('day ' + d + ': two chests share an id');
      for (const v of ['home', 'awards']) { A.S.view = v; A.S.result = null; try { A.render(); if (/NaN|undefined/.test(A.els.app.innerHTML)) note('day ' + d + ': NaN or undefined in ' + v) } catch (e) { note('day ' + d + ': ' + v + ' ' + e.message) } }
    }
  }
  ok(!bad.length, 'play-through found: ' + bad.join(' | '));
  const p = A.S.prog; ok(p.chestsWon >= p.chestsOpened && p.chestsOpened === opened, 'every opened chest was won first: ' + p.chestsWon + ' won, ' + opened + ' opened');
  ok(boostedRounds / rounds < .3, 'the booster stays a small extra: ' + boostedRounds + ' of ' + rounds + ' rounds boosted');
  console.log('T play-through: 90 days,', rounds, 'rounds,', boostedRounds, 'boosted,', p.chestsWon, 'chests won,', opened, 'opened,', p.chestUps, 'upgrades,', coinsFromChests, 'coins from chests, wallet', p.coins, '(earned ' + p.coinsEarned + '), level', A.levelInfo(p.xp).n, ', most chests waiting', maxInv);
}
console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exitCode = fails ? 1 : 0;
