// Advent calendar (since 2.7): doors by date, gifts once, nothing expires, private photos stay behind their door.
const { load, lists } = require('./harness');
const units = lists();
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('  FAIL', msg) } };
const at = (y, m, d, h = 16) => new Date(y, m - 1, d, h, 0, 0).getTime();
const store = extra => ({ 'wordbox.units.v1': JSON.stringify(units), 'wordbox.prog.v1': JSON.stringify(Object.assign({ v: 1, econ: 2, tempo: 'fast', onboarded: true, v2: true, sound: false, speak: false, goal: 150, lvl: 1, coins: 0, news: '2.6' }, extra || {})) });
const app = (t, extra, more) => load(Object.assign({ clock: { t }, storage: store(extra) }, more || {}));
const html = (A, view) => { A.S.view = view; A.S.result = null; A.render(); return A.els.app.innerHTML };
const text = h => h.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const tap = (A, n) => A.ACT['adv-door']({ dataset: { n: String(n) } });
const toast = A => text(A.els.toast.innerHTML);
// A pack as tools/advent-paket.py writes it. The "photo" of day n is a few bytes that start like a JPEG.
const photo = n => Uint8Array.from([0xFF, 0xD8, 0xFF, 0xE0, n, n * 3 % 256, 7, 42, 0, 255].concat(Array.from({ length: 120 }, (_, i) => (i * n) % 251)));
const scramble = (bytes, y, n) => { const key = 'voc-a-bit-advent-' + y + '-' + n; return Uint8Array.from(bytes, (b, i) => b ^ key.charCodeAt(i % key.length)) };
const b64 = bytes => Buffer.from(bytes).toString('base64');
const pack = (y = 2026) => { const days = {}; for (let n = 1; n <= 24; n++) days[n] = { img: b64(scramble(photo(n), y, n)), text: 'Geheimer Satz Nummer ' + n + ' vom Sommerurlaub.', gift: n % 6 === 0 ? 'Gutschein Nummer ' + n + ': Film aussuchen' : undefined }; return { type: 'voc-a-bit-advent', year: y, days } };

async function main() {
  // what is behind the doors
  {
    const A = app(at(2026, 12, 1));
    ok(A.ADVENT.length === 24 && A.ADVENT_YEAR === 2026, '24 doors for 2026');
    A.ADVENT.forEach((a, i) => {
      const f = a.fun || [];
      ok(a.en && a.de && a.ex && a.ex.length < 70, 'door ' + (i + 1) + ': word, meaning and a short example');
      ok((f[0] === 'q' && f.length === 4 && f.every(x => x)) || ((f[0] === 'f' || f[0] === 't') && f.length === 3 && f.every(x => x)), 'door ' + (i + 1) + ': something to smile about, complete');
      const g = a.gift || {};
      ok(Object.keys(g).every(k => ['chest', 'coins', 'freeze', 'boost'].indexOf(k) >= 0) && (!g.chest || A.TIERS.indexOf(g.chest) >= 0) && (!g.boost || (g.boost[0] > 1 && g.boost[0] <= 2 && g.boost[1] === 1)), 'door ' + (i + 1) + ': a gift the app knows');
    });
    ok(new Set(A.ADVENT.map(a => a.en)).size === 24, 'no word twice');
    ok(A.ADVENT.map((a, i) => a.skin ? i + 1 : 0).filter(Boolean).join() === '6,13,20,24', 'the days kept for skins: St Nicholas, two Sundays, Christmas Eve');
    ok(A.ADVENT.reduce((s, a) => s + ((a.gift && a.gift.coins) || 0), 0) <= 120, 'coins from the doors stay small');
    ok(A.ADV_ORDER.slice().sort((a, b) => a - b).join() === Array.from({ length: 24 }, (_, i) => i + 1).join(), 'every number once on the calendar');
  }
  // before 1 December there is no calendar, and the update does not announce one
  {
    const A = app(at(2026, 11, 30, 23));
    ok(!A.advStarted() && !A.advSeason() && A.advOpen(1) === null, 'not started on 30 November');
    ok(!/Advent/.test(html(A, 'home')) && !/Advent/.test(html(A, 'awards')) && !/Advent/.test(html(A, 'settings')), 'no trace on start page, Erfolge and settings');
    A.ACT['adv-go'](); ok(A.S.view !== 'advent', 'the calendar cannot be entered');
    A.S.view = 'advent'; A.render(); ok(A.S.view === 'home', 'a stray view falls back to the start page');
    A.timers.slice().forEach(f => f()); ok(!/Advent|Türchen|Kalender/.test(toast(A)) && /Bit hat einen neuen Look/.test(toast(A)) && A.S.prog.news === A.NEWS[0], 'the update toast tells of the new look and gives nothing away about the calendar: ' + toast(A));
  }
  // 1 December: door 1 opens, door 2 waits for its day; a gift is booked once
  {
    const clock = { t: at(2026, 12, 1, 7) }, A = load({ clock, storage: store() });
    ok(A.advStarted() && A.advSeason() && A.advWaiting().join() === '1', 'door 1 is ready');
    ok(/Adventskalender/.test(html(A, 'home')) && /Türchen 1 wartet auf dich\./.test(text(html(A, 'home'))), 'card on the start page');
    A.ACT['adv-go'](); ok(A.S.view === 'advent', 'the card leads to the calendar');
    const grid = A.els.app.innerHTML;
    ok((grid.match(/class="door /g) || []).length === 24 && (grid.match(/is-ready/g) || []).length === 1 && (grid.match(/is-shut/g) || []).length === 23 && !/NaN|undefined/.test(grid), 'calendar: 24 doors, one ready');
    tap(A, 2); ok(A.S.door === null && !A.advOpened(2) && /Türchen 2 öffnet sich am 2\. Dezember\./.test(toast(A)), 'door 2 says when it opens and stays shut');
    tap(A, 1);
    ok(A.S.door && A.S.door.fresh && A.advOpened(1) && A.S.prog.advent.open[1] === '2026-12-01', 'door 1 is open');
    ok(A.S.prog.inv.length === 1 && A.S.prog.inv[0].tier === 'RARE' && A.S.prog.inv[0].source === 'ADVENT', 'a silver chest from the calendar is in the bag');
    const d = A.els.app.innerHTML;
    ok(/Türchen 1/.test(d) && /Advent calendar/.test(d) && /Silbertruhe/.test(d) && /Schön!/.test(d) && !/advPic/.test(d) && !/Gutschein/.test(d), 'the door shows word and gift; without a pack no photo');
    ok(/<ul class="loots"><li><svg class="art[^>]*>\s*<[a-z]/.test(d), 'the gift line shows a drawn chest, not an empty picture');
    ok(/Antwort zeigen/.test(d) && !/Snow!/.test(d), 'the riddle hides its answer'); A.ACT['door-show'](); ok(/Snow!/.test(A.els.app.innerHTML), 'and shows it on a tap');
    ok(JSON.parse(A.mem['wordbox.prog.v1']).advent.open[1] === '2026-12-01', 'saved at once');
    A.ACT['door-close'](); ok(A.S.door === null && /is-open/.test(A.els.app.innerHTML), 'closed again, the door stays open on the calendar');
    tap(A, 1); ok(A.S.door && !A.S.door.fresh && A.S.prog.inv.length === 1 && /Schließen/.test(A.els.app.innerHTML) && !/liegt in deiner Tasche/.test(A.els.app.innerHTML), 'looking again brings no second gift');
    A.ACT['door-close']();
    ok(/Türchen 2 öffnet sich am 2\. Dezember\./.test(text(html(A, 'home'))), 'the card says when the next door comes');
    // after a restart nothing is given twice
    const B = load({ clock, storage: A.mem }); ok(B.advOpened(1) && B.advWaiting().length === 0 && B.advOpen(1).fresh === false && B.S.prog.inv.length === 1, 'restart: door 1 stays open, no second chest');
  }
  // nothing expires: missed doors wait, also after Christmas and long after
  {
    const clock = { t: at(2026, 12, 1) }, A = load({ clock, storage: store({ freezes: 0 }) });
    tap(A, 1); A.ACT['door-close']();
    clock.t = at(2026, 12, 5); ok(A.advWaiting().join() === '2,3,4,5' && /4 Türchen warten auf dich\./.test(text(html(A, 'home'))), 'four days away: four doors wait');
    const c0 = A.S.prog.coins; tap(A, 3); ok(A.S.prog.coins === c0 + 10 && /\+10 Münzen/.test(A.els.app.innerHTML), 'door 3: ten coins'); A.ACT['door-close']();
    tap(A, 5); ok(A.S.prog.freezes === 1 && /Serien-Schutz/.test(A.els.app.innerHTML), 'door 5: a Serien-Schutz'); A.ACT['door-close']();
    clock.t = at(2026, 12, 24, 8); ok(A.advWaiting().length === 21, 'on Christmas Eve every unopened door is ready');
    const before = { coins: A.S.prog.coins, inv: A.S.prog.inv.length }; tap(A, 24);
    ok(A.S.prog.coins === before.coins + 50 && A.S.prog.inv.length === before.inv && A.S.prog.outfits['fn-polarlicht'] && /Neuer Skin: Aurora-Legende/.test(text(A.els.app.innerHTML)) && /skins\/fn-polarlicht\.webp/.test(A.els.app.innerHTML), 'door 24: the Aurora-Legende and 50 coins, no chest'); ok(A.S.prog.outfit !== 'fn-polarlicht', 'the skin is not put on by itself'); A.ACT['door-close']();
    tap(A, 10); ok(A.xpMult() === 1.5 && /1,5x XP/.test(A.els.app.innerHTML), 'door 10: a small booster'); A.ACT['door-close']();
    A.S.prog.freezes = 2; const c1 = A.S.prog.coins; tap(A, 17); ok(A.S.prog.freezes === 2 && A.S.prog.coins === c1 + 12, 'door 17 with a full bag: coins instead of a third Serien-Schutz'); A.ACT['door-close']();
    clock.t = at(2027, 1, 6, 20); ok(A.advSeason() && /advent-card/.test(html(A, 'home')), '6 January: the card is still on the start page');
    clock.t = at(2027, 1, 7, 9); ok(!A.advSeason() && !/advent-card/.test(html(A, 'home')) && /adv-go/.test(html(A, 'awards')), 'from 7 January the calendar lives under Erfolge');
    clock.t = at(2027, 3, 15); A.ACT['adv-go'](); ok(A.S.view === 'advent', 'in March it can still be entered'); tap(A, 2); ok(A.advOpened(2) && A.S.door.fresh, 'and a door from December still opens'); A.ACT['door-close']();
    for (let n = 1; n <= 24; n++) { tap(A, n); A.ACT['door-close']() }
    ok(A.advCount() === 24 && A.advWaiting().length === 0 && /Alle 24 Türchen sind offen/.test(A.advLine()), 'all 24 open');
    const chests = A.S.prog.inv.filter(c => c.source === 'ADVENT').map(c => c.tier).sort().join();
    ok(chests === 'EPIC,EPIC,EPIC,RARE', 'chests from the whole calendar: ' + chests);
    const skins = Object.keys(A.S.prog.outfits).sort().join();
    ok(skins === 'fn-lebkuchen,fn-nussknacker,fn-polarlicht,fn-ranger', 'the four skin days gave four skins: ' + skins);
  }
  // the skin days: which skin, what happens if it is there already, and a door opened before the skins existed
  {
    const clock = { t: at(2026, 12, 24, 9) }, A = load({ clock, storage: store() });
    ok([6, 13, 20, 24].map(n => A.advSkin(n)).join() === 'fn-ranger,fn-lebkuchen,fn-nussknacker,fn-polarlicht' && A.advSkin(1) === '' && A.advSkin(7) === '', 'skins of the four days');
    ok([6, 13, 20, 24].every(n => A.OUTFITS.some(o => o.id === A.advSkin(n) && o.cost > 0)), 'every calendar skin can also be bought: nobody has to wait for a date');
    // bought before the door: the door gives its diamond chest instead
    A.S.prog.coins = 1000; A.ACT['buy-outfit']({ dataset: { o: 'fn-ranger' } }); ok(A.S.prog.outfits['fn-ranger'], 'ranger bought');
    const inv = A.S.prog.inv.length; tap(A, 6);
    ok(A.S.prog.inv.length === inv + 1 && A.S.prog.inv[inv].tier === 'MEGA' && !/Neuer Skin/.test(text(A.els.app.innerHTML)) && /Diamanttruhe/.test(text(A.els.app.innerHTML)), 'skin already there: the door holds a diamond chest'); A.ACT['door-close']();
    tap(A, 13); ok(A.S.prog.outfits['fn-lebkuchen'] && A.S.prog.inv.length === inv + 1, 'door 13: the Keks-Krieger'); A.ACT['door-close']();
    tap(A, 13); ok(!A.S.door.fresh && A.S.door.got.length === 0, 'a second look gives nothing twice'); A.ACT['door-close']();
    // a save in which door 20 was opened when it still held a chest: the skin follows at the next start, once
    const old = store({ advent: { y: 2026, open: { 20: '2026-12-20' } }, news: A.NEWS[0] });
    const B = load({ clock: { t: at(2026, 12, 21) }, storage: old });
    ok(B.S.prog.outfits['fn-nussknacker'] && !B.S.prog.outfits['fn-ranger'] && B.S.prog.outfit !== 'fn-nussknacker', 'the skin of an opened door follows');
    B.timers.slice().forEach(f => f()); ok(/Kapitän Knack/.test(toast(B)), 'and the app says so: ' + toast(B));
    const C = load({ clock: { t: at(2026, 12, 22) }, storage: B.mem }); C.timers.slice().forEach(f => f()); ok(!/Nussknacker/.test(toast(C)) && C.advOwed().length === 0, 'only once');
    // before December nothing of this shows in the shop: the skins are there, the calendar is not named
    const D = load({ clock: { t: at(2026, 11, 25) }, storage: store() }); ok(/Frostnacht-Legenden/.test(text(html(D, 'shop'))) && !/Advent|Türchen|Kalender/.test(text(html(D, 'shop'))), 'the shop shows the winter line and keeps the calendar a secret');
  }
  // no sentence of the calendar presses: no "nur noch", nothing about missing out
  {
    const clock = { t: at(2026, 12, 1) }, A = load({ clock, storage: store() }), said = [];
    for (const [m, d] of [[12, 1], [12, 2], [12, 9], [12, 23], [12, 24], [12, 25], [12, 31]]) { clock.t = at(m === 12 ? 2026 : 2027, m, d); said.push(A.advLine(), text(html(A, 'advent'))); tap(A, Math.min(24, d + 1)); said.push(toast(A)); if (A.S.door) A.ACT['door-close']() }
    ok(!/nur noch|verpass|läuft ab|letzte Chance|schnell|beeil|sonst/i.test(said.join(' ')), 'no pressure in the words of the calendar');
  }
  // a damaged field in the save does not stop the app
  {
    for (const bad of ['kaputt', 7, [], { y: 'x', open: {} }, { y: 2026, open: 'nein' }]) {
      const A = app(at(2026, 12, 3), { advent: bad }); ok(A.S.prog.advent === null && /Adventskalender/.test(html(A, 'home')) && A.advOpen(1).fresh, 'odd advent field repaired: ' + JSON.stringify(bad));
    }
    const A = app(at(2026, 12, 3), { advent: { y: 2025, open: { 1: '2025-12-01', 2: '2025-12-02' } } }); ok(!A.advOpened(1) && A.advOpen(1).fresh && A.S.prog.advent.y === 2026, 'a calendar of another year does not count');
  }
  // the private pack: read, kept on the device, and never shown before its door is open
  {
    const P = pack(), A = app(at(2026, 12, 3));
    const R = A.advReadPack(P); ok(R && R.y === 2026 && Object.keys(R.days).length === 24 && R.days[6].gift && R.days[5].gift === '' && R.days[1].img.length === photo(1).length, 'pack read: 24 days');
    ok(A.advReadPack(null) === null && A.advReadPack({ type: 'voc-a-bit-lektion', words: [] }) === null && A.advReadPack({ type: 'voc-a-bit-advent', year: 2026, days: {} }) === null && A.advReadPack({ type: 'voc-a-bit-advent', year: 2026, days: { 30: { text: 'x' }, 0: { text: 'y' } } }) === null, 'no pack, another file, an empty pack, days outside 1–24');
    const odd = A.advReadPack({ type: 'voc-a-bit-advent', year: 2026, days: { 2: { img: 'kein base64 !!!'.repeat(20), text: 'x'.repeat(900), gift: 5 }, 3: { img: 'A'.repeat(1600000) }, 4: 'quatsch' } });
    ok(odd && Object.keys(odd.days).join() === '2' && odd.days[2].img === null && odd.days[2].text.length === 400 && odd.days[2].gift === '', 'a broken picture, an endless text and a picture that is too big are left out');
    ok(A.advImport(pack(2025)) === false && Object.keys(A.advPack.days).length === 0, 'a pack for another year is refused');
    ok(A.advImport(P) === true && Object.keys(A.advPack.days).length === 24 && A.advPack.days[3].pic === true && A.advPack.days[3].text === 'Geheimer Satz Nummer 3 vom Sommerurlaub.', 'pack taken, the app knows it at once');
    await new Promise(r => setImmediate(r));      // the device stores the pack, then the note comes
    ok(/Fotopaket geladen/.test(toast(A)), 'the parent gets a note: ' + toast(A));
    // nowhere outside an open door
    const everywhere = ['home', 'advent', 'awards', 'settings', 'vocab', 'practice'].map(v => html(A, v)).join(' ');
    ok(!/Geheimer Satz|Gutschein Nummer|Sommerurlaub/.test(everywhere), 'no private word on any page while the doors are shut');
    ok(/Fotopaket: 24 Fotos, Inhalt für 24 Türchen/.test(text(html(A, 'settings'))), 'settings only count what is there');
    ok(await A.advPic(3) === null && await A.advPic(9) === null, 'no picture for a door that is not open, today or later');
    A.ACT['adv-go'](); tap(A, 3); const d = A.els.app.innerHTML;
    ok(/id="advPic"/.test(d) && /Geheimer Satz Nummer 3/.test(d) && !/Geheimer Satz Nummer 4/.test(d) && !/Gutschein/.test(d) && /candle/.test(d), 'door 3: its photo and its sentence, next to the word of the day');
    const pic = await A.advPic(3); ok(pic && pic.length === photo(3).length && pic.every((b, i) => b === photo(3)[i]), 'the picture comes out as it went in');
    ok(await A.advPic(4) === null, 'the neighbour stays hidden'); A.ACT['door-close']();
    A.clock.t = at(2026, 12, 6); tap(A, 6); ok(/Gutschein Nummer 6: Film aussuchen/.test(A.els.app.innerHTML) && /class="notice door-gift"/.test(A.els.app.innerHTML), 'door 6 carries a voucher from the parents'); A.ACT['door-close']();
    // text from the parents is shown as text, never as markup
    const X = app(at(2026, 12, 2)); X.advImport({ type: 'voc-a-bit-advent', year: 2026, days: { 1: { text: '<img src=x onerror=alert(1)> & viel Spaß' } } }); X.ACT['adv-go'](); tap(X, 1);
    ok(/&lt;img src=x onerror=alert\(1\)&gt; &amp; viel Spaß/.test(X.els.app.innerHTML) && !/<img src=x/.test(X.els.app.innerHTML), 'a sentence with angle brackets stays a sentence');
    // removing the pack
    A.S.view = 'settings'; A.ACT['adv-clear-ask'](); ok(/Wirklich entfernen\?/.test(A.els.app.innerHTML), 'removing asks first'); A.ACT['adv-clear-yes']();
    ok(Object.keys(A.advPack.days).length === 0 && await A.advPic(3) === null, 'pack removed'); A.S.view = 'advent'; tap(A, 3);
    ok(!/advPic|Geheimer Satz/.test(A.els.app.innerHTML) && /candle/.test(A.els.app.innerHTML) && A.advOpened(3), 'the doors themselves stay as they are, only the private part is gone'); A.ACT['door-close']();
  }
  // before December the pack goes in through "Datei öffnen" on the import page, which has no word about a calendar
  {
    const A = app(at(2026, 11, 25));
    A.ACT['imp-open'](); ok(!/Advent/.test(A.els.app.innerHTML), 'import page without a hint');
    A.startReview(A.parseText(JSON.stringify(pack())), 'Voc a Bit Adventspaket 2026');
    ok(Object.keys(A.advPack.days).length === 24 && A.S.imp === null && A.S.view === 'vocab' && A.S.units.length === units.length, 'the pack is taken, no lesson is made of it');
    ok(/Adventskalender/.test(html(A, 'settings')) && !/Advent/.test(html(A, 'home')), 'now the parents find it under settings, the start page still shows nothing');
    A.ACT['imp-open'](); A.startReview(A.parseText(JSON.stringify(pack(2025)))); ok(A.S.imp && /passt nicht/.test(A.S.imp.err), 'a pack of another year gets an answer');
  }
  // Android: back closes the door, then leaves the calendar
  {
    const A = app(at(2026, 12, 2), {}, { ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' });
    A.ACT['adv-go'](); tap(A, 1); ok(A.S.door, 'door open'); A.back(); ok(A.S.door === null && A.S.view === 'advent', 'back closes the door'); A.back(); ok(A.S.view === 'home', 'back again: start page');
  }
  console.log('T advent: done');
  console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exitCode = fails ? 1 : 0;
}
main().catch(e => { console.log('  FAIL', e && e.stack || e); process.exitCode = 1 });
