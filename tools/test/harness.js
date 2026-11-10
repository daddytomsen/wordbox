// Test harness: loads the app script from index.html into a stubbed browser and exposes internals.
// Run all tests with tools/check.sh, or one file with: node tools/test/spiel.test.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'index.html');
function makeDate(clock) {
  const Real = Date;
  class FakeDate extends Real {
    constructor(...a) { if (a.length) super(...a); else super(clock.t) }
    static now() { return clock.t }
  }
  return FakeDate;
}
function load(opts = {}) {
  const lines = fs.readFileSync(SRC, 'utf8').split('\n');
  const a = lines.findIndex(l => l.trim() === '(() => {'), b = lines.lastIndexOf('})();');
  const body = lines.slice(a + 1, b).join('\n');
  const mem = Object.assign({}, opts.storage || {});
  const el = () => ({ innerHTML: '', textContent: '', style: {}, dataset: {}, value: '', classList: { add() {}, remove() {} }, addEventListener() {}, setAttribute() {}, appendChild() {}, remove() {}, click() {}, focus() {}, contains() { return true }, querySelector() { return null }, querySelectorAll() { return [] }, getBoundingClientRect() { return { top: 0, bottom: 0 } } });
  const els = { app: el(), toast: el() };
  const clock = opts.clock || { t: Date.now() };
  const timers = [];
  const env = {
    localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v) }, removeItem: k => { delete mem[k] } },
    document: { getElementById: id => els[id] || null, addEventListener() {}, hidden: false, createElement: () => el(), body: { appendChild() {} }, head: { appendChild() {} }, documentElement: { dataset: {} }, querySelectorAll: () => [], activeElement: null },
    window: { scrollTo() {}, scrollBy() {}, addEventListener() {} },
    navigator: {}, location: { protocol: 'file:', reload() {} },
    matchMedia: () => ({ matches: !opts.vt }),      // tests run with reduced motion, unless they bring a view-transition stub performance: { now: () => 0 }, requestAnimationFrame: () => 0,
    setTimeout: (f) => { timers.push(f); return 0 }, clearTimeout: () => {}, console, Date: makeDate(clock), innerHeight: 800, innerWidth: 400, scrollTo() {},
  };
  if (opts.vt) env.document.startViewTransition = opts.vt;
  const names = Object.keys(env);
  const expose = `\n;return { get S() { return S }, ACT, BADGES, QUESTS, OUTFITS, TEMPOS, store, grade, composeRound, buildRound, tiersOf, pickOpts, pastWrong, pastAlts, makeQ, variants, checkTyped, startRound, settle, answerMC, nextQ, finish, targetInfo, checkTargets, streakInfo, streakTick, questsToday, checkQuests, dayStats, payGoal, pathNodes, nodeInfo, allNodes, smartPlan, badgeCtx, checkBadges, levelInfo, render, index, fach, isDue, todayKey, xpToday, persist, migrateProg, freshProg, viewHome, viewPractice, viewVocab, viewAwards, viewShop, viewSettings, viewQuiz, viewResult, parseText, listToUnit, bit, SKINS, transit, settleUp, cleanUnits, ws };`;
  const fn = new Function(...names, body + expose);
  const api = fn(...names.map(n => env[n]));
  api.mem = mem; api.clock = clock; api.els = els; api.timers = timers;
  return api;
}
function lists() {
  const dir = path.join(ROOT, 'lists') + path.sep;
  const idx = JSON.parse(fs.readFileSync(dir + 'index.json', 'utf8')).lists;
  return idx.map((L, i) => { const d = JSON.parse(fs.readFileSync(dir + L.file, 'utf8')); return { id: L.id, rev: L.rev, source: 'server', title: d.title, pages: d.pages, order: i + 1, words: d.words } });
}
module.exports = { load, lists };
