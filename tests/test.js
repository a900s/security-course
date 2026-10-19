const puppeteer = require('puppeteer-core');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = '/workspace/security-course';
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]).replace(/^\/security-course/, '');
  let f = path.join(ROOT, u); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  const t = {'.js':'text/javascript','.css':'text/css','.html':'text/html'}[path.extname(f)] || 'application/octet-stream';
  r.writeHead(200, {'content-type': t + '; charset=utf-8'}); fs.createReadStream(f).pipe(r);
}).listen(8765);
const GSI = `window.google={accounts:{id:{initialize:function(o){window.__gsiCb=o.callback},renderButton:function(h){h.innerHTML='<button id="fakeGsi">fake</button>'},disableAutoSelect:function(){}}}};`;
function jwt(p){const b=s=>Buffer.from(JSON.stringify(s)).toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');return b({alg:'none'})+'.'+b(p)+'.sig';}
const A = jwt({sub:'111',name:'王小明',email:'  Ming.Wang@lgm.kh.edu.tw '}), B = jwt({sub:'222',name:'李小華',email:'hua@lgm.kh.edu.tw'});
let fails = 0;
function check(mod, name, cond, info) { console.log((cond ? '  ✓ ' : '  ✗ ') + name + (info ? '  [' + info + ']' : '')); if (!cond) fails++; }
(async () => {
  const br = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox']});
  for (const mod of ['owasp-top10', 'kali-top20', 'sql-injection-lab', 'ctf']) {
    console.log('== ' + mod);
    const solvedKey = { 'owasp-top10': 'owasp_course_solved_v1', 'sql-injection-lab': 'sql_course_solved_v1', 'kali-top20': 'kali_course_solved_v1', 'ctf': 'ctf_course_solved_v1' }[mod];
    const ctx = await br.createBrowserContext(); const pg = await ctx.newPage();
    let confirmAnswer = true; pg.on('dialog', d => confirmAnswer ? d.accept() : d.dismiss());
    pg.on('pageerror', e => { console.log('  PAGEERROR', e.message); fails++; });
    await pg.setRequestInterception(true);
    pg.on('request', q => q.url().includes('accounts.google.com/gsi/client') ? q.respond({status:200, contentType:'text/javascript', body:GSI}) : (q.url().startsWith('http://localhost:8765') ? q.continue() : q.abort()));
    const base = 'http://localhost:8765/security-course/' + mod + '/';
    await pg.goto(base, {waitUntil: 'load'});
    const isO = true;
    const slugs = await pg.evaluate(() => CHALLENGES.map(c => c.slug));
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    async function go(hash) { await pg.evaluate(h => { location.hash = h; }, hash); await sleep(150); }
    async function signIn(t) { await pg.waitForFunction(() => window.__gsiCb); await pg.evaluate(t => window.__gsiCb({credential: t}), t); await sleep(150); }
    async function signOut() { await pg.click('#gsiOut'); await sleep(150); }
    async function answer(n, right = true) {
      const prev = await pg.evaluate(k => localStorage.getItem(StudentAuth.key(k)), solvedKey);
      let left = n, i = 0, total = 0;
      while (left > 0 && i < slugs.length) {
        await pg.evaluate((k, a) => localStorage.setItem(StudentAuth.key(k), JSON.stringify(a)), solvedKey, Array.from({ length: i }, (_, x) => x));
        await go('#/' + slugs[i]);
        const got = await pg.evaluate((n, right) => { let c = 0; for (const s of document.querySelectorAll('section.review')) { if (c >= n) break; const opt = s.querySelector('.rv-opt'); if (!opt || opt.disabled) continue; s.querySelector('.rv-opt[data-ok="' + (right ? 1 : 0) + '"]').click(); c++; } return c; }, left, right);
        total += got; left -= got; i++;
        if (!got) break;
      }
      if (prev == null) await pg.evaluate(k => localStorage.removeItem(StudentAuth.key(k)), solvedKey);
      else await pg.evaluate((k, v) => localStorage.setItem(StudentAuth.key(k), v), solvedKey, prev);
      await go('#/');
      return total;
    }
    async function state() {
      if (isO) await go('#/' + slugs[0]);
      const cards = await pg.evaluate(() => document.querySelectorAll('section.review.rv-done-ok,section.review.rv-done-ng').length);
      if (isO) await go('#/');
      return pg.evaluate((cards) => {
        let answered = 0;
        try { const raw = localStorage.getItem(StudentAuth.key(REVIEW_DATA.storageKey)); answered = raw ? Object.keys(JSON.parse(raw)).length : 0; } catch (e) {}
        return { answered, who: (document.querySelector('.gsi-name') || {}).textContent || '(anon)', cards,
          solvedCells: document.querySelectorAll('.cell.solved').length };
      }, cards);
    }
    async function seedSolved(arr) { await pg.evaluate((k, a) => localStorage.setItem(StudentAuth.key(k), JSON.stringify(a)), solvedKey, arr); await go('#/x'); await go('#/'); }
    const dn = s => s.answered;
    check(mod, 'no reset or teacher controls', await pg.evaluate(() => !document.getElementById('gsiReset') && !document.getElementById('resetBtn') && !/教師區|教師專區/.test(document.body.innerText) && !!document.querySelector('a[href="../"]')));
    // anon: 1 answer (simulates legacy un-namespaced data)
    await answer(1, false);
    let s = await state(); check(mod, 'anon 1 answered', dn(s) === 1 && s.who === '(anon)', String(dn(s)));
    const anonRaw = await pg.evaluate(() => localStorage.getItem(REVIEW_DATA.storageKey));
    check(mod, 'anon uses legacy base key', !!anonRaw);
    // A
    await signIn(A); s = await state();
    check(mod, 'A starts at 0 (legacy anon data not migrated)', dn(s) === 0 && s.cards === 0 && s.who === '王小明', String(dn(s)));
    await answer(2); if (isO) await seedSolved([0, 1, 2]); s = await state();
    check(mod, 'A answered 2', dn(s) === 2 && (isO ? s.solvedCells === 3 : s.cards === 2), dn(s) + ' cells ' + s.solvedCells);
    const keyA = await pg.evaluate(() => StudentAuth.key(REVIEW_DATA.storageKey));
    check(mod, 'key namespaced by email hash, email not in key', /::u:[0-9a-f]+$/.test(keyA) && !/ming/i.test(keyA), keyA);
    // sign out -> anon
    await signOut(); s = await state();
    check(mod, 'sign-out shows anonymous state', dn(s) === 1 && s.who === '(anon)' && (isO ? s.solvedCells === 0 : s.cards === 1), String(dn(s)));
    // B
    await signIn(B); s = await state();
    check(mod, 'B starts at 0', dn(s) === 0 && s.cards === 0 && (!isO || s.solvedCells === 0) && s.who === '李小華', String(dn(s)));
    await answer(1); s = await state(); check(mod, 'B answered 1', dn(s) === 1, String(dn(s)));
    // back to A (email in different case/space -> same account)
    await signOut(); await signIn(jwt({sub:'999', name:'王小明', email:'ming.wang@LGM.kh.edu.tw'})); s = await state();
    check(mod, 'back to A restores A (email normalized)', dn(s) === 2 && s.solvedCells === 3, String(dn(s)) + ' cells ' + s.solvedCells);
    // reload keeps A
    await pg.reload({waitUntil: 'load'}); await sleep(300); s = await state();
    check(mod, 'reload while signed in as A keeps A', dn(s) === 2 && s.who === '王小明', String(dn(s)));
    await pg.evaluate(() => StudentAuth.resetProgress(true)); await sleep(300); s = await state();
    check(mod, 'resetProgress still clears only this account', dn(s) === 0 && s.cards === 0 && (!isO || s.solvedCells === 0), String(dn(s)));
    // B and anon untouched
    await signOut(); s = await state(); check(mod, 'anon untouched by A reset', dn(s) === 1, String(dn(s)));
    await signIn(B); s = await state(); check(mod, 'B untouched by A reset', dn(s) === 1, String(dn(s)));
    await ctx.close();
  }
  await br.close(); srv.close();
  console.log(fails ? 'FAILS: ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
