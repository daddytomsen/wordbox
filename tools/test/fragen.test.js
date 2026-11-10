const { load, lists } = require('./harness');
const units = lists();
const day = (y, m, d, h = 10) => new Date(y, m - 1, d, h, 0, 0).getTime();
const ymd = t => { const x = new Date(t); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0') };
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('  FAIL', msg) } };

// ---- T1: old 1.15 state loads, migrates, every view renders ----
{
  const clock = { t: day(2026, 11, 10) };
  const w = {}; units[0].words.forEach((x, i) => w[x.id] = { l: i < 100 ? 4 : 2, r: 4, x: 0, s: clock.t - 864e5, d: clock.t - 1000 });
  const prog = { v: 1, econ: 2, tempo: 'fast', name: 'T', goal: 150, onboarded: true, sound: false, speak: false, xp: 3172, days: { [ymd(clock.t)]: 160, [ymd(clock.t - 864e5)]: 150 }, streak: 4, best: 9, last: ymd(clock.t - 864e5), rounds: 72, perfect: 9, typedRight: 39, pastRight: 40, extraRight: 12, bestCombo: 12, goalDays: 9, photos: 0, badges: { first: 'x' }, w, sel: null, mode: 'mix', len: 10, targets: [{ id: 't1', title: 'Test', due: ymd(clock.t + 3 * 864e5), ids: units[1].words.slice(0, 20).map(x => x.id), base: {}, need: 2, created: ymd(clock.t), done: '' }, { id: 't0', title: 'Alt', due: '2026-10-20', ids: [], base: {}, need: 2, created: '2026-10-15', done: '2026-10-19' }] };
  const A = load({ clock, storage: { 'wordbox.units.v1': JSON.stringify(units), 'wordbox.prog.v1': JSON.stringify(prog) } });
  const p = A.S.prog;
  ok(p.goalDay === ymd(clock.t), 'goal reached today under old rules is remembered, got ' + p.goalDay);
  ok(p.goalDays === 9, 'goalDays not double counted: ' + p.goalDays);
  ok(p.targetsDone === 1, 'targetsDone migrated: ' + p.targetsDone);
  ok(p.coins >= 0 && p.v2 === false && p.since2 === ymd(clock.t), 'new fields present');
  ok(A.streakInfo().n === 4, 'streak shown: ' + A.streakInfo().n);
  for (const v of ['home', 'practice', 'vocab', 'awards', 'shop', 'settings']) { try { A.S.view = v; A.render(); ok(A.els.app.innerHTML.length > 500, v + ' renders') } catch (e) { fails++; console.log('  FAIL render', v, e.message) } }
  ok(/Voc a Bit ist neu/.test((A.S.view = 'home', A.render(), A.els.app.innerHTML)), 'what is new dialog for an existing user');
  console.log('T1 migration + views: badges', Object.keys(p.badges).length, 'coins', p.coins, 'nodes', A.allNodes().map(x => x.nodes.length).join('/'));
}

// ---- T2: questions never offer a second right answer ----
{
  const A = load({ clock: { t: day(2026, 11, 10) }, storage: { 'wordbox.units.v1': JSON.stringify(units) } });
  let n = 0, twins = 0, dup = 0, missing = 0;
  for (const w of A.S.words) for (const t of ['de-en', 'en-de', 'past', 'opp', 'gap']) {
    const can = t === 'de-en' || t === 'en-de' || (t === 'past' && w.pos === 'verb' && w.past) || (t === 'opp' && w.opp) || (t === 'gap' && w.ex && w.gap && w.ex.indexOf(w.gap) >= 0);
    if (!can) continue;
    for (let k = 0; k < 8; k++) {
      const q = A.makeQ(w, t, false); n++;
      if (q.options.filter(o => o === q.answer).length !== 1) missing++;
      if (new Set(q.options.map(o => o.toLowerCase())).size !== q.options.length) dup++;
      const mine = new Set(A.variants(w.en));
      for (const o of q.options) { if (o === q.answer) continue;
        if (t === 'en-de' && A.S.words.some(x => x.id !== w.id && x.de === o && A.variants(x.en).some(v => mine.has(v)))) twins++;
        if (t === 'de-en' && A.S.words.some(x => x.id !== w.id && x.en === o && (x.de === w.de))) twins++; }
    }
  }
  ok(!twins, 'twin translations offered as wrong: ' + twins); ok(!dup, 'duplicate options: ' + dup); ok(!missing, 'answer not exactly once: ' + missing);
  console.log('T2 questions:', n, 'built, twins', twins, 'dups', dup);
  const pw = w => A.pastWrong(A.S.words.find(x => x.en === w && x.past));
  console.log('   past distractors: to be →', pw('to be').join('|'), '· to have →', pw('to have').join('|'), '· to light →', pw('to light').join('|'), '· to burn →', pw('to burn').join('|'));
  ok(pw('to light').indexOf('lighted') < 0 && pw('to burn').indexOf('burned') < 0, 'valid regular forms are not offered as wrong');
}

// ---- T3: typed answers ----
{
  const A = load({ clock: { t: day(2026, 11, 10) }, storage: { 'wordbox.units.v1': JSON.stringify(units) } });
  const C = (i, t) => { const r = A.checkTyped(i, t); return r.ok ? (r.almost ? 'almost' : 'ok') : 'no' };
  const cases = [['to ask (for sth)', 'to ask (for sth)', 'ok'], ['ask for something', 'to ask (for sth)', 'ok'], ['to ask', 'to ask (for sth)', 'ok'], ['to feed', 'to feel', 'no'], ['that', 'than', 'no'], ['call', 'to fall', 'no'], ['plane', 'to plan', 'no'], ['coast', 'to cost', 'no'], ['fight', 'light', 'no'],
    ['everythin', 'everything', 'almost'], ['sudenly', 'suddenly', 'almost'], ['to break my arm', "to break one's arm", 'ok'], ['to break his arm', "to break one's arm", 'ok'], ['Christmas', 'Christmas', 'ok'], ['christmas', 'Christmas', 'ok'], ["new year's eve", "New Year's Eve", 'ok'], ['vlog', 'vlog (= video blog)', 'ok'], ['video blog', 'vlog (= video blog)', 'ok'], ['a lot of', 'a lot (of)', 'ok'], ['a lot', 'a lot (of)', 'ok'], ['xyz', 'everything', 'no'], ['', 'everything', 'no']];
  for (const [i, t, want] of cases) ok(C(i, t) === want, `typed "${i}" for "${t}" → ${C(i, t)}, expected ${want}`);
  console.log('T3 typed answers:', cases.length, 'cases');
}
console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exitCode = fails ? 1 : 0;
