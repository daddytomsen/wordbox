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
  // Listeners on window and document are kept, so a test can send an event (popstate, beforeinstallprompt, click).
  const heard = { window: {}, document: {} };
  const listen = who => (type, f) => { (heard[who][type] = heard[who][type] || []).push(f) };
  // A small browser history: opts.history = { state } starts on an entry with that state (a reload on the guard entry).
  const hist = { stack: [opts.history ? opts.history.state : null], i: 0, pushes: 0 };
  const history = { get state() { return hist.stack[hist.i] }, get length() { return hist.stack.length },
    pushState(st) { hist.stack.length = hist.i + 1; hist.stack.push(st); hist.i++; hist.pushes++ }, replaceState(st) { hist.stack[hist.i] = st } };
  const created = [];
  // opts.speech: the browser can read aloud. Everything said is kept in api.said.
  const said = [];
  const speechSynthesis = { getVoices: () => [], speak(u) { said.push(u.text) }, cancel() {}, resume() {}, speaking: false, pending: false, paused: false };
  function SpeechSynthesisUtterance(text) { this.text = text }
  const env = {
    localStorage: { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v) }, removeItem: k => { delete mem[k] } },
    document: { getElementById: id => els[id] || null, addEventListener: listen('document'), hidden: false, createElement: () => { const e = el(); created.push(e); return e }, body: { appendChild() {} }, head: { appendChild() {} }, documentElement: { dataset: {} }, querySelectorAll: () => [], activeElement: null },
    window: Object.assign({ scrollTo() {}, scrollBy() {}, addEventListener: listen('window') }, opts.speech ? { speechSynthesis } : {}), history, speechSynthesis, SpeechSynthesisUtterance,
    navigator: Object.assign({ userAgent: opts.ua || '' }, opts.nav || {}), location: Object.assign({ protocol: 'file:', reload() {} }, opts.loc || {}),
    matchMedia: q => ({ matches: opts.media ? !!opts.media(q) : !opts.vt }),      // tests run with reduced motion, unless they bring a view-transition stub performance: { now: () => 0 }, requestAnimationFrame: () => 0,
    setTimeout: (f) => { timers.push(f); return 0 }, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {}, console, Date: makeDate(clock), innerHeight: 800, innerWidth: 400, scrollTo() {},
  };
  if (opts.vt) env.document.startViewTransition = opts.vt;
  const names = Object.keys(env);
  const expose = `\n;return { get S() { return S }, ACT, BADGES, QUESTS, OUTFITS, TEMPOS, store, grade, composeRound, buildRound, tiersOf, pickOpts, pastWrong, pastAlts, makeQ, variants, checkTyped, startRound, settle, answerMC, nextQ, finish, targetInfo, checkTargets, streakInfo, streakTick, checkQuests, dayStats, payGoal, pathNodes, nodeInfo, allNodes, smartPlan, badgeCtx, checkBadges, levelInfo, lvlStart, render, index, fach, isDue, todayKey, xpToday, persist, migrateProg, freshProg, viewHome, viewPractice, viewVocab, viewAwards, viewShop, viewSettings, viewQuiz, viewResult, parseText, listToUnit, bit, SKINS, transit, settleUp, cleanUnits, ws, deParts,
    TIERS, CHEST, STREAK_CHESTS, addChest, dayChest, rollLoot, applyLoot, tapChest, addBoost, useBoost, xpMult, questTier, questSlots, track,
    ANDROID, IOS, STANDALONE, backStep, armBack, installCard, unitFile, unitFileName, startReview, saveImport, go, toast,
    ladderType, ladderTypes, mustWrite, canHear, gateHolds, targetLacksWrite, targetWantsWrite, writing, applicable, LADDER, WRITE_SHARE, MIX_W, answerTyped, viewQuiz };`;
  const fn = new Function(...names, body + expose);
  const api = fn(...names.map(n => env[n]));
  api.mem = mem; api.clock = clock; api.els = els; api.timers = timers; api.hist = hist; api.created = created; api.said = said;
  api.fire = (type, ev, who = 'window') => (heard[who][type] || []).forEach(f => f(ev || {}));
  // The back button: one entry back and a popstate, as the browser does it. false = no entry left, the app would close.
  api.back = () => { if (hist.i === 0) return false; hist.i--; api.fire('popstate', { state: hist.stack[hist.i] }); return true };
  return api;
}
function lists() {
  const dir = path.join(ROOT, 'lists') + path.sep;
  const idx = JSON.parse(fs.readFileSync(dir + 'index.json', 'utf8')).lists;
  return idx.map((L, i) => { const d = JSON.parse(fs.readFileSync(dir + L.file, 'utf8')); return { id: L.id, rev: L.rev, source: 'server', title: d.title, pages: d.pages, order: i + 1, words: d.words } });
}
module.exports = { load, lists };
