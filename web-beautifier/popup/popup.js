/**
 * 网页美化师 · WebBeautifier — 弹出面板逻辑
 */

const DEFAULTS = {
  enabled: true,
  darkMode: false,
  darkStrength: 80,
  fontOptimize: true,
  roundCards: true,
  focusGlow: true,
  contrast: 100,
  saturation: 100,
  scrollbar: true,
  readWidth: false
};

// 各控件对应的设置键
const BIND = {
  enabled: 'enabled',
  darkMode: 'darkMode',
  darkStrength: 'darkStrength',
  fontOptimize: 'fontOptimize',
  roundCards: 'roundCards',
  focusGlow: 'focusGlow',
  scrollbar: 'scrollbar',
  readWidth: 'readWidth',
  contrast: 'contrast',
  saturation: 'saturation'
};

function $(id){ return document.getElementById(id); }

async function loadSettings() {
  const s = await chrome.storage.sync.get(DEFAULTS);
  return { ...DEFAULTS, ...s };
}

function applyToUi(s) {
  $('enabled').checked = !!s.enabled;
  $('darkMode').checked = !!s.darkMode;
  $('darkStrength').value = s.darkStrength;
  $('darkVal').textContent = s.darkStrength;
  $('contrast').value = s.contrast;
  $('contrastVal').textContent = s.contrast + '%';
  $('saturation').value = s.saturation;
  $('saturationVal').textContent = s.saturation + '%';
  $('fontOptimize').checked = !!s.fontOptimize;
  $('roundCards').checked = !!s.roundCards;
  $('focusGlow').checked = !!s.focusGlow;
  $('scrollbar').checked = !!s.scrollbar;
  $('readWidth').checked = !!s.readWidth;
  // 暗色亮度行可见性
  $('darkRow').style.display = s.darkMode ? '' : 'none';
}

async function init() {
  const s = await loadSettings();
  applyToUi(s);

  // 绑定所有开关
  const controls = ['enabled','darkMode','fontOptimize','roundCards','focusGlow','scrollbar','readWidth'];
  controls.forEach(id => {
    $(id).addEventListener('change', async () => {
      const cur = await loadSettings();
      cur[BIND[id]] = !!$(id).checked;
      await chrome.storage.sync.set({ [BIND[id]]: cur[BIND[id]] });
      if (id === 'darkMode') $('darkRow').style.display = cur.darkMode ? '' : 'none';
      notifyTabs();
    });
  });

  $('darkStrength').addEventListener('input', async ()=>{
    const v=+$('darkStrength').value; $('darkVal').textContent=v;
    await chrome.storage.sync.set({darkStrength:v}); notifyTabs();
  });
  $('contrast').addEventListener('input', async ()=>{
    const v=+$('contrast').value; $('contrastVal').textContent=v+'%';
    await chrome.storage.sync.set({contrast:v}); notifyTabs();
  });
  $('saturation').addEventListener('input', async ()=>{
    const v=+$('saturation').value; $('saturationVal').textContent=v+'%';
    await chrome.storage.sync.set({saturation:v}); notifyTabs();
  });

  $('resetBtn').addEventListener('click', async ()=>{
    await chrome.storage.sync.set(DEFAULTS);
    applyToUi(DEFAULTS);
    notifyTabs();
  });
}

// 通知所有标签页刷新（内容脚本已监听 storage.onChanged，兜底广播更稳妥）
function notifyTabs(){
  chrome.tabs.query({}, (tabs)=>{
    for(const t of tabs){
      try{ chrome.tabs.sendMessage(t.id,{type:'WB_REFRESH'}); }catch(e){}
    }
  });
}

document.addEventListener('DOMContentLoaded', init);