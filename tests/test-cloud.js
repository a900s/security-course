const puppeteer = require('puppeteer-core');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = '/workspace/security-course';
let MODE = 'ok'; const DB = {}; const LOG = [];
const TEST_CFG = `window.FIREBASE_CONFIG={apiKey:"test-key",authDomain:"x.firebaseapp.com",projectId:"test-proj",appId:"1:1:web:1"};window.FIREBASE_SDK_VERSION="13.0.0";`;
function body(q){return new Promise(r=>{let b='';q.on('data',d=>b+=d);q.on('end',()=>r(b?JSON.parse(b):{}));});}
const srv = http.createServer(async (q, r) => {
  if (q.url.startsWith('/__mock/')) {
    r.setHeader('Access-Control-Allow-Origin','*'); r.setHeader('content-type','application/json');
    if (MODE === 'hang') return; // never respond
    if (MODE === 'fail') { r.writeHead(503); return r.end('{}'); }
    const b = await body(q); LOG.push(q.url.split('?')[0] + ' ' + (b.path || ''));
    const who = b.auth;
    if (q.url.startsWith('/__mock/auth')) return r.end('{}');
    if (q.url.startsWith('/__mock/get')) {
      const [col, id] = b.path.split('/');
      if (col === 'progress' && id !== who && !DB['teachers/' + who]) { r.writeHead(403); return r.end('{}'); }
      if (col === 'teachers' && id !== who) { r.writeHead(403); return r.end('{}'); }
      return r.end(JSON.stringify({exists: !!DB[b.path], data: DB[b.path] || null}));
    }
    if (q.url.startsWith('/__mock/list')) {
      if (!DB['teachers/' + who]) { r.writeHead(403); return r.end('{}'); }
      return r.end(JSON.stringify(Object.keys(DB).filter(k => k.startsWith(b.col + '/')).map(k => ({id: k.split('/')[1], data: DB[k]}))));
    }
    if (q.url.startsWith('/__mock/set')) {
      if (b.path !== 'progress/' + who) { r.writeHead(403); return r.end('{}'); }
      const d = DB[b.path] || {}; for (const f of b.opts.mergeFields) { if (b.data[f] === '__TS__') d[f] = {seconds: Date.now() / 1000}; else d[f] = b.data[f]; }
      DB[b.path] = d; return r.end('{}');
    }
  }
  let u = decodeURIComponent(q.url.split('?')[0]).replace(/^\/security-course/, '');
  let f = path.join(ROOT, u); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  const t = {'.js':'text/javascript','.css':'text/css','.html':'text/html'}[path.extname(f)] || 'application/octet-stream';
  r.writeHead(200, {'content-type': t + '; charset=utf-8'}); fs.createReadStream(f).pipe(r);
}).listen(8766);
const M = 'http://localhost:8766/__mock/';
const MOCK = {
 'firebase-app.js': `const apps=[];export function initializeApp(c){const a={c};apps.push(a);return a}export function getApps(){return apps}`,
 'firebase-auth.js': `const A={currentUser:JSON.parse(localStorage.getItem('__mockFbUser')||'null'),authStateReady:()=>Promise.resolve()};window.__fbAuth=A; /* 模擬 Firebase 的 IndexedDB 登入持久化 */
  export function getAuth(){return A}
  export const GoogleAuthProvider={credential:t=>({t})};
  export async function signInWithCredential(a,c){const p=JSON.parse(atob(c.t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    const r=await fetch('${M}auth',{method:'POST',body:'{}'});if(!r.ok)throw Object.assign(new Error('network'),{code:'auth/network-request-failed'});
    A.currentUser={email:p.email.trim().toLowerCase()};localStorage.setItem('__mockFbUser',JSON.stringify(A.currentUser));window.__fbSignIns=(window.__fbSignIns||0)+1;return {user:A.currentUser}}
  export async function signOut(a){a.currentUser=null;localStorage.removeItem('__mockFbUser');window.__fbSignOuts=(window.__fbSignOuts||0)+1}`,
 'firebase-firestore.js': `const who=()=>window.__fbAuth.currentUser&&window.__fbAuth.currentUser.email;
  async function call(op,b){b.auth=who();const r=await fetch('${M}'+op,{method:'POST',body:JSON.stringify(b)});if(r.status===403)throw Object.assign(new Error('Missing or insufficient permissions'),{code:'permission-denied'});if(!r.ok)throw Object.assign(new Error('offline'),{code:'unavailable'});return r.json()}
  export function getFirestore(){return {}}
  export function doc(db,c,id){return {path:c+'/'+id}}
  export function collection(db,c){return {col:c}}
  export function serverTimestamp(){return '__TS__'}
  export async function getDoc(ref){const j=await call('get',{path:ref.path});return {exists:()=>j.exists,data:()=>j.data}}
  export async function getDocs(c){const j=await call('list',{col:c.col});return {forEach:f=>j.forEach(d=>f({id:d.id,data:()=>d.data}))}}
  export async function setDoc(ref,data,opts){await call('set',{path:ref.path,data,opts})}`
};
function jwt(p){const b=s=>Buffer.from(JSON.stringify(s)).toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');return b({alg:'none'})+'.'+b(p)+'.sig';}
const A = jwt({name:'王小明',email:'Ming.Wang@lgm.kh.edu.tw'}), B = jwt({name:'李小華',email:'hua@lgm.kh.edu.tw'}), T = jwt({name:'老師',email:'a900s@lgm.kh.edu.tw'});
const GSI = `window.google={accounts:{id:{initialize:function(o){window.__gsiCb=o.callback},renderButton:function(h){h.innerHTML='<button>fake</button>'},disableAutoSelect:function(){}}}};`;
let fails = 0; const sleep = ms => new Promise(r => setTimeout(r, ms));
function check(name, cond, info) { console.log((cond ? '  ✓ ' : '  ✗ ') + name + (info !== undefined ? '  [' + info + ']' : '')); if (!cond) fails++; }
let br;
async function page(opts = {}) { // opts.gstatic: 'mock' | 'block' | 'hang' ; opts.config: bool
  const ctx = opts.ctx || await br.createBrowserContext(); const pg = await ctx.newPage(); pg.__ctx = ctx; pg.__errors = []; pg.__gstatic = 0;
  pg.on('dialog', d => d.accept());
  pg.on('pageerror', e => pg.__errors.push('pageerror: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|net::/.test(m.text())) pg.__errors.push('console: ' + m.text()); });
  await pg.setRequestInterception(true);
  pg.on('request', q => {
    const u = q.url();
    if (u.includes('accounts.google.com/gsi/client')) return q.respond({status:200, contentType:'text/javascript', body:GSI});
    if (u.includes('gstatic.com/firebasejs/')) { pg.__gstatic++;
      if (opts.gstatic === 'block') return q.abort('blockedbyclient');
      if (opts.gstatic === 'hang') return; // never answer
      const name = u.split('/').pop(); return q.respond({status:200, contentType:'text/javascript', headers:{'Access-Control-Allow-Origin':'*'}, body: MOCK[name]}); }
    if (u.includes('firestore.googleapis.com') || u.includes('googleapis.com')) return q.abort();
    if (opts.config !== false && /\/js\/firebase-config\.js/.test(u)) return q.respond({status:200, contentType:'text/javascript', body:TEST_CFG});
    return u.startsWith('http://localhost:8766') ? q.continue() : q.abort();
  });
  return pg;
}
const url = m => 'http://localhost:8766/security-course/' + m + '/';
async function signIn(pg, t) { await pg.waitForFunction(() => window.__gsiCb); await pg.evaluate(t => window.__gsiCb({credential: t}), t); }
const cloud = pg => pg.evaluate(() => (document.getElementById('gsiCloud') || {}).textContent || '');
const done = pg => pg.evaluate(() => { try { const raw = localStorage.getItem(StudentAuth.key(REVIEW_DATA.storageKey)); return raw ? Object.keys(JSON.parse(raw)).length : 0; } catch (e) { return -1; } });
async function answer(pg, n, right = true) { return pg.evaluate((n, right) => { let c = 0; for (const s of document.querySelectorAll('section.review')) { if (c >= n) break; const b = s.querySelector('.rv-opt[data-ok="' + (right ? 1 : 0) + '"]'); if (b.disabled) continue; b.click(); c++; } return c; }, n, right); }
async function waitCloud(pg, re, ms = 9000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const c = await cloud(pg); if (re.test(c)) return c; await sleep(100); } return await cloud(pg); }
const AK = 'progress/ming.wang@lgm.kh.edu.tw';
(async () => {
  br = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox']});

  console.log('== 0. 未設定（空 config）：不載入 SDK、無雲端狀態');
  { const pg = await page({config: false, gstatic: 'mock'}); await pg.goto(url('kali-top20'), {waitUntil: 'load'}); await signIn(pg, A); await sleep(300); await answer(pg, 1); await sleep(2000);
    check('no gstatic request', pg.__gstatic === 0, pg.__gstatic); check('CloudSync.configured() false', !(await pg.evaluate(() => CloudSync.configured())));
    check('no cloud status text', (await cloud(pg)) === '', await cloud(pg)); check('no errors', !pg.__errors.length, pg.__errors.join('|')); await pg.__ctx.close(); }

  console.log('== 1. 登入時雲端失敗（503）→ 本機照常；恢復後合併');
  MODE = 'fail';
  const d1 = await page({gstatic: 'mock'}); await d1.goto(url('kali-top20'), {waitUntil: 'load'}); await signIn(d1, A);
  let c = await waitCloud(d1, /未同步/); check('status 未同步 while failing', /⚠️ 未同步/.test(c), c);
  check('page usable: answered 2 locally', (await answer(d1, 2)) === 2 && (await done(d1)) === 2, await done(d1));
  // seed cloud: q3 only in cloud; q2 in cloud with older t and other option; sql field must stay
  const Q = await d1.evaluate(() => { const D = REVIEW_DATA.questions, st = JSON.parse(localStorage.getItem(StudentAuth.key(REVIEW_DATA.storageKey)));
    return { q3: {qv: D[2].qv, id: D[2].options[D[2].correct].id, ok: true, t: 5000}, q2wrong: {qv: D[1].qv, id: D[1].options[(D[1].correct + 1) % 4].id, ok: false, t: 1}, local2: st['2'].id }; });
  DB[AK] = { kali: { review: { '2': Q.q2wrong, '3': Q.q3 } }, sql: { review: { '9': {qv: 'x', id: 'y', ok: true, t: 1} } }, name: '王小明', email: 'ming.wang@lgm.kh.edu.tw' };
  MODE = 'ok'; await d1.evaluate(() => window.dispatchEvent(new Event('online')));
  c = await waitCloud(d1, /已同步/); check('after online: 已同步', /☁️ 已同步/.test(c), c);
  check('merged locally: 3 answered (1,2 local + 3 from cloud)', (await done(d1)) === 3, await done(d1));
  check('q3 card re-rendered as answered', await d1.evaluate(() => document.querySelector('section.review[data-q="3"]').classList.contains('rv-done-ok')));
  check('q2: newer local answer kept in cloud', DB[AK].kali.review['2'].id === Q.local2);
  check('cloud has 1,2,3', Object.keys(DB[AK].kali.review).sort().join() === '1,2,3', Object.keys(DB[AK].kali.review));
  check('other module (sql) untouched', DB[AK].sql && DB[AK].sql.review['9']);
  check('email lowercased + updatedAt set', DB[AK].email === 'ming.wang@lgm.kh.edu.tw' && DB[AK].updatedAt && DB[AK].updatedAt.seconds > 0);
  check('no errors', !d1.__errors.length, d1.__errors.join('|'));

  console.log('== 2. 合併規則（單元）');
  const mr = await d1.evaluate(() => { const m = CloudSync._merge;
    const a = m('kali', {review: {5: {id: 'L'}}}, {review: {5: {id: 'C'}}});
    const b = m('owasp', {review: {}, solved: [0, 2], levelProgress: {name: '', challenges: {x: {updatedAt: '2026-10-01T00:00:00Z', v: 'L'}, y: {updatedAt: '2026-01-01T00:00:00Z', v: 'L'}}}},
      {review: {}, solved: [1, 2], levelProgress: {name: 'n', challenges: {x: {updatedAt: '2026-09-01T00:00:00Z', v: 'C'}, y: {updatedAt: '2026-05-01T00:00:00Z', v: 'C'}, z: {v: 'C'}}}});
    return [a.review[5].id, b.solved.join(), b.levelProgress.challenges.x.v, b.levelProgress.challenges.y.v, b.levelProgress.challenges.z.v]; });
  check('no timestamps → prefer cloud', mr[0] === 'C'); check('OWASP solved union', mr[1] === '0,1,2', mr[1]);
  check('levelProgress newer per slug', mr[2] === 'L' && mr[3] === 'C' && mr[4] === 'C', mr.slice(2));

  console.log('== 3. 第二台裝置：載入雲端進度、debounce 寫入、重置清雲端');
  const d2 = await page({gstatic: 'mock'}); await d2.goto(url('kali-top20'), {waitUntil: 'load'}); await signIn(d2, A);
  c = await waitCloud(d2, /已同步/); check('device2 gets 3 from cloud', (await done(d2)) === 3 && /已同步/.test(c), await done(d2));
  const nSet0 = LOG.filter(x => x.startsWith('/__mock/set')).length;
  await answer(d2, 2); await sleep(400);
  check('debounced (no write yet after 0.4s)', LOG.filter(x => x.startsWith('/__mock/set')).length === nSet0);
  await waitCloud(d2, /已同步/); await sleep(1800);
  check('one debounced write for 2 answers', LOG.filter(x => x.startsWith('/__mock/set')).length === nSet0 + 1, LOG.filter(x => x.startsWith('/__mock/set')).length - nSet0);
  check('cloud now 5', Object.keys(DB[AK].kali.review).length === 5);
  await d2.evaluate(() => StudentAuth.resetProgress(true)); await sleep(300); c = await waitCloud(d2, /已同步/);
  check('reset: local 0', (await done(d2)) === 0); check('reset: cloud kali.review empty', Object.keys(DB[AK].kali.review).length === 0, JSON.stringify(DB[AK].kali));
  check('reset: sql untouched', !!DB[AK].sql.review['9']);
  check('no errors d2', !d2.__errors.length, d2.__errors.join('|'));

  console.log('== 4. 離線時重置 → 恢復後不被雲端舊資料蓋回');
  await d2.reload({waitUntil: 'load'}); await waitCloud(d2, /已同步/); await answer(d2, 3); await sleep(2200); await waitCloud(d2, /已同步/);
  check('cloud has 3 before offline reset', Object.keys(DB[AK].kali.review).length === 3);
  MODE = 'fail'; await d2.evaluate(() => StudentAuth.resetProgress(true)); c = await waitCloud(d2, /未同步/);
  check('offline reset: local 0, 未同步', (await done(d2)) === 0 && /未同步/.test(c), c);
  MODE = 'ok'; await d2.reload({waitUntil: 'load'}); c = await waitCloud(d2, /已同步/);
  check('after reload online: local stays 0', (await done(d2)) === 0, await done(d2));
  check('cloud cleared (local wins after reset)', Object.keys(DB[AK].kali.review).length === 0, Object.keys(DB[AK].kali.review));

  console.log('== 5. 登出');
  await d2.click('#gsiOut'); await sleep(300);
  check('signout: firebase signOut called, anon state', (await d2.evaluate(() => window.__fbSignOuts)) >= 1 && (await d2.evaluate(() => !document.getElementById('gsiCloud'))));
  await d1.__ctx.close(); await d2.__ctx.close();

  console.log('== 6. OWASP：關卡（solved/levelProgress）同步');
  { MODE = 'ok'; DB[AK].owasp = { solved: [0, 1], levelProgress: { name: '', challenges: { a01: { updatedAt: '2026-10-01T00:00:00Z', phase: 'fixed' } } }, review: {} };
    const pg = await page({gstatic: 'mock'}); await pg.goto(url('owasp-top10'), {waitUntil: 'load'}); await signIn(pg, A); await waitCloud(pg, /已同步/); await sleep(300);
    const st = await pg.evaluate(() => ({ cells: document.querySelectorAll('.cell.solved').length, badge: !!document.getElementById('pnum') }));
    check('OWASP map shows 2 solved from cloud', st.cells === 2 && !st.badge, String(st.cells));
    check('kali field untouched by OWASP page', DB[AK].kali && Array.isArray(Object.keys(DB[AK].kali.review)));
    check('no errors', !pg.__errors.length, pg.__errors.join('|')); await pg.__ctx.close(); }

  const LEVEL = { 'owasp-top10': ['owasp_course_solved_v1', 12, 'owasp'], 'sql-injection-lab': ['sql_course_solved_v1', 20, 'sql'], 'kali-top20': ['kali_course_solved_v1', 20, 'kali'], 'ctf': ['ctf_course_solved_v1', 20, ''], 'genai-security': ['genai_security_solved_v1', 20, ''], 'social-engineering': ['social_engineering_solved_v1', 20, ''] };
  console.log('== 7. 教師區已從課程頁移除');
  { const pg = await page({gstatic: 'mock'});
    for (const mod of Object.keys(LEVEL)) {
      await pg.goto(url(mod), {waitUntil: 'load'});
      const info = await pg.evaluate(() => ({ teacher: /教師區|教師專區/.test(document.body.innerText), home: !!document.querySelector('a[href="../"]'), form: !!document.querySelector('[data-quiz-form]') }));
      check(mod + ' no teacher area', !info.teacher);
      check(mod + ' links home', info.home);
      check(mod + ' has google form', !info.form);
    }
    check('no errors', !pg.__errors.length, pg.__errors.join('|')); await pg.__ctx.close(); }

  for (const [label, gs, mode] of [['gstatic 被封鎖', 'block', 'ok'], ['gstatic 無回應（逾時）', 'hang', 'ok'], ['Firestore 無回應（逾時）', 'mock', 'hang']]) {
    for (const mod of Object.keys(LEVEL)) {
      console.log('== 8. ' + label + '：' + mod + ' 頁面完整可用');
      MODE = mode; const pg = await page({gstatic: gs}); const t0 = Date.now();
      await pg.goto(url(mod), {waitUntil: 'load', timeout: 15000}); const tl = Date.now() - t0;
      check('page load not blocked (<3s)', tl < 3000, tl + 'ms');
      await signIn(pg, B); await sleep(200);
      if (LEVEL[mod]) { const slug = await pg.evaluate(() => CHALLENGES[0].slug); await pg.evaluate(s => location.hash = '#/' + s, slug); await sleep(200); }
      check('answer works immediately', (await answer(pg, 1)) === 1);
      if (LEVEL[mod]) { await pg.evaluate(() => location.hash = '#/'); await sleep(200); }
      check('answer stored', (await done(pg)) === 1, await done(pg));
      c = await waitCloud(pg, /未同步/, 12000); check('shows 未同步 after timeout/failure', /⚠️ 未同步/.test(c), c);
      {
        const spec = LEVEL[mod];
        check('map hides unit practice', await pg.evaluate(() => !document.getElementById('finalReview') && !document.querySelector('section.review')));
        check('login shows level progress', await pg.evaluate(t => { const m = ((document.getElementById('gsiStatus') || {}).textContent || '').match(/已完成 (\d+)\/(\d+)/); return !!(m && Number(m[2]) === t); }, spec[1]));
        const slug = await pg.evaluate(() => CHALLENGES[0].slug);
        await pg.evaluate(s => { location.hash = '#/' + s; }, slug); await sleep(200);
        check('level shows its practice', await pg.evaluate(() => document.querySelectorAll('section.review').length > 0));
        check('level hides the form', await pg.evaluate(() => !document.querySelector('[data-quiz-form]')));
        await pg.evaluate((k) => {
          localStorage.setItem(StudentAuth.key(k), JSON.stringify(CHALLENGES.map((_, i) => i)));
          location.hash = '#/done'; location.hash = '#/';
        }, spec[0]);
        await sleep(200);
        check('form after all levels', await pg.evaluate(id => id ? !!document.querySelector('[data-quiz-form="' + id + '"]') : !document.querySelector('[data-quiz-form]'), spec[2]));
        check('no final review', await pg.evaluate(() => !document.getElementById('finalReview')));
      }
      check('no reset button', await pg.evaluate(() => !document.getElementById('gsiReset')));
      await pg.evaluate(() => StudentAuth.resetProgress(true)); await sleep(200); check('resetProgress clears this account', (await done(pg)) === 0);
      await pg.click('#gsiOut'); await sleep(200); check('sign-out works', await pg.evaluate(() => !!document.getElementById('gsiBtn')));
      check('no uncaught errors', !pg.__errors.length, pg.__errors.join('|'));
      await pg.__ctx.close();
      if (gs !== 'block') break; // timeout variants: one module each is enough (slow)
    }
  }
  MODE = 'ok';
  await br.close(); srv.close();
  console.log(fails ? 'FAILS: ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
