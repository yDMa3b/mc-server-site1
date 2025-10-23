/* ======== 可配置参数：也可在 index.html 的 data-* 改 ======== */
const card = document.querySelector('.server-card');
const HOST = (card?.dataset.host || 'play.yourserver.net').trim();
const PORT = (card?.dataset.port || '25565').trim();
const BLUEMAP_PORT = (card?.dataset.map || '8123').trim();

/* ======== UI 绑定 ======== */
const addrEl = document.getElementById('addr');
const addrInline = document.getElementById('addrInline') || document.createElement('span');
const copyBtn = document.getElementById('copyBtn');
const copyBtn2 = document.getElementById('copyBtn2');
const refreshBtn = document.getElementById('refreshBtn');
const dot = document.getElementById('statusDot');
const text = document.getElementById('statusText');
const pill = document.getElementById('playerCount');
const mapBtn = document.getElementById('mapBtn');
const fxToggle = document.getElementById('fxToggle');

const addrText = `${HOST}:${PORT}`;
addrEl.textContent = addrText;
addrInline.textContent = addrText;
if (BLUEMAP_PORT && BLUEMAP_PORT !== 'null') mapBtn.href = `http://${HOST}:${BLUEMAP_PORT}/`; else mapBtn.style.display = 'none';

/* ======== 复制 & Toast ======== */
function toast(msg, danger=false){
  const t = document.createElement('div');
  t.className = 'toast' + (danger ? ' danger' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 240); }, 1800);
}
async function doCopy(){
  try{ await navigator.clipboard.writeText(addrText); toast('已复制服务器地址'); }
  catch{ toast('复制失败，请手动复制', true); }
}
copyBtn?.addEventListener('click', doCopy);
copyBtn2?.addEventListener('click', doCopy);

/* ======== 服务器状态（mcsrvstat.us） ======== */
async function fetchStatus(){
  try{
    dot.className = 'dot pulse';
    text.textContent = '检测中…';
    pill.textContent = '--/--';
    const res = await fetch(`https://api.mcsrvstat.us/2/${HOST}:${PORT}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.online){
      dot.className = 'dot on';
      text.textContent = '在线';
      pill.textContent = `${data.players?.online ?? 0}/${data.players?.max ?? '--'}`;
    }else{
      dot.className = 'dot off';
      text.textContent = '离线';
      pill.textContent = '--/--';
    }
  }catch(e){
    dot.className = 'dot off';
    text.textContent = '查询失败';
    pill.textContent = '--/--';
  }
}
refreshBtn?.addEventListener('click', fetchStatus);
fetchStatus();

/* ======== 动态背景（Canvas 星空 + 视差） ======== */
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let stars = [];
let animId = null;
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
function rand(a,b){ return Math.random()*(b-a)+a; }
function initStars(){
  stars = [];
  const n = Math.min(200, Math.floor(innerWidth*innerHeight/8000));
  for(let i=0;i<n;i++){
    stars.push({
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      r: rand(0.4,1.6),
      s: rand(0.15,0.6),            // 速度
      o: rand(0.4,1),               // 透明度
      tw: rand(0, Math.PI*2)        // 闪烁相位
    });
  }
}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const st of stars){
    st.y += st.s; if(st.y > canvas.height) { st.y = -2; st.x = rand(0, canvas.width); }
    st.tw += 0.02;
    ctx.globalAlpha = st.o*(0.6+0.4*Math.sin(st.tw));
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(200, 255, 255, 0.9)';
    ctx.fill();
  }
  animId = requestAnimationFrame(draw);
}
function startFX(){ resize(); initStars(); cancelAnimationFrame(animId); draw(); document.body.classList.remove('no-fx'); }
function stopFX(){ cancelAnimationFrame(animId); ctx.clearRect(0,0,canvas.width,canvas.height); document.body.classList.add('no-fx'); }

addEventListener('resize', ()=>{ if(!document.body.classList.contains('no-fx')){ resize(); initStars(); }});
addEventListener('mousemove', (e)=>{
  // 视差：根据鼠标位置微移山体
  const x = (e.clientX / innerWidth - 0.5) * 10;
  const y = (e.clientY / innerHeight - 0.5) * 6;
  document.querySelector('.layer.far').style.transform  = `translate(${x*0.4}px, ${y*0.2}px)`;
  document.querySelector('.layer.mid').style.transform  = `translate(${x*0.8}px, ${y*0.4}px)`;
  document.querySelector('.layer.near').style.transform = `translate(${x*1.2}px, ${y*0.8}px)`;
});

/* 开关特效（默认开） */
function setFX(on){
  fxToggle.checked = on;
  on ? startFX() : stopFX();
  fxToggle.nextElementSibling.textContent = on ? '特效 ON' : '特效 OFF';
}
fxToggle?.addEventListener('change', e=> setFX(e.target.checked));

/* 遵循系统“减少动画”偏好 */
const rm = matchMedia('(prefers-reduced-motion: reduce)');
setFX(!rm.matches); rm.addEventListener?.('change', e=> setFX(!e.matches));
