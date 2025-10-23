/* ===========================
   可配置参数（改成你的）
=========================== */
// 也可以直接在 index.html 的 data-* 上改，这里读取它们
const card = document.querySelector('.server-card');
const HOST = (card?.dataset.host || 'play.yourserver.net').trim();
const PORT = (card?.dataset.port || '25565').trim();
const BLUEMAP_PORT = (card?.dataset.map || '8123').trim(); // 若不需要地图，可在 HTML 写 data-map="" 或在下面隐藏按钮

/* ========= 基础绑定 ========= */
const addrEl = document.getElementById('addr');
const addrInline = document.getElementById('addrInline');
const copyBtn = document.getElementById('copyBtn');
const copyBtn2 = document.getElementById('copyBtn2');
const refreshBtn = document.getElementById('refreshBtn');
const dot = document.getElementById('statusDot');
const text = document.getElementById('statusText');
const pill = document.getElementById('playerCount');
const mapBtn = document.getElementById('mapBtn');

const addrText = `${HOST}:${PORT}`;
addrEl.textContent = addrText;
addrInline.textContent = addrText;

// BlueMap 链接：若未配置则隐藏按钮
if (BLUEMAP_PORT && BLUEMAP_PORT !== 'null') {
  mapBtn.href = `http://${HOST}:${BLUEMAP_PORT}/`;
} else {
  mapBtn.style.display = 'none';
}

/* ========= 复制地址 ========= */
function toast(msg, danger=false){
  const t = document.createElement('div');
  t.className = 'toast' + (danger ? ' danger' : '');
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{
    t.classList.remove('show');
    setTimeout(()=>t.remove(), 260);
  }, 1800);
}

async function doCopy(){
  try{
    await navigator.clipboard.writeText(addrText);
    toast('已复制服务器地址');
  }catch{
    toast('复制失败，请手动复制', true);
  }
}

copyBtn?.addEventListener('click', doCopy);
copyBtn2?.addEventListener('click', doCopy);

/* ========= 查询服务器状态 =========
   API: https://api.mcsrvstat.us/2/<host>:<port>
   返回:
   { online: true/false, players: { online, max }, ... }
=================================== */
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
      const online = data.players?.online ?? 0;
      const max = data.players?.max ?? '--';
      pill.textContent = `${online}/${max}`;
    } else {
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

// 首次进入自动查询一次
fetchStatus();
