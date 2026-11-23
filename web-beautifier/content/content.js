/**
 * 网页美化师 · WebBeautifier — 内容脚本（核心美化引擎）
 * 在页面 document_start 注入，根据设置动态生成并应用 CSS。
 */

// 默认设置
const DEFAULT_SETTINGS = {
  enabled: true,              // 总开关
  darkMode: false,            // 暗色模式
  darkStrength: 80,           // 暗色亮度 (10~120)
  fontOptimize: true,         // 字体排版优化
  roundCards: true,           // 圆角卡片
  focusGlow: true,            // 点击/焦点高光
  contrast: 100,              // 对比度 (80~130)
  saturation: 100,            // 饱和度 (80~140)
  scrollbar: true,            // 美化滚动条
  readWidth: false            // 阅读列宽
};

let settings = { ...DEFAULT_SETTINGS };
const STYLE_ID = 'web-beautifier-style';
const ATTR_EL = document.documentElement;

// 暗色模式动态媒体观察器（在文件顶部声明，避免 TDZ）
let _observer = null;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// 读取设置（同步触发一次初始化）
chrome.storage.sync.get(DEFAULT_SETTINGS, (saved) => {
  settings = { ...DEFAULT_SETTINGS, ...saved };
  if (settings.enabled) apply(); else removeStyle();
});

// 监听后台/弹窗的即时更新
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  let changed = false;
  for (const k of Object.keys(changes)) {
    if (k in DEFAULT_SETTINGS) { settings[k] = changes[k].newValue; changed = true; }
  }
  if (!changed) return;
  if (settings.enabled) apply(); else removeStyle();
});

// 兜底：接收弹窗的显式广播
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'WB_REFRESH') {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (saved) => {
      settings = { ...DEFAULT_SETTINGS, ...saved };
      if (settings.enabled) apply(); else removeStyle();
    });
    sendResponse({ ok: true });
  }
});

function removeStyle() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
  ATTR_EL.removeAttribute('data-wb-dark');
  ATTR_EL.removeAttribute('data-wb-theme');
  // 清除功能类
  ['web-beautifier-on','web-beautifier-round','web-beautifier-focus','web-beautifier-scroll','web-beautifier-read','web-beautifier-dark'].forEach(c => document.documentElement.classList.remove(c));
  UntagMedia();
}

function apply() {
  // 移除旧样式
  let styleEl = document.getElementById(STYLE_ID);
  if (styleEl) styleEl.remove();

  // 同步 html 上的功能类，供 CSS 选择器锚定
  const html = document.documentElement;
  const CLASSES = {
    font: 'web-beautifier-on',
    roundCards: 'web-beautifier-round',
    focusGlow: 'web-beautifier-focus',
    scrollbar: 'web-beautifier-scroll',
    readWidth: 'web-beautifier-read',
    darkMode: 'web-beautifier-dark'
  };
  const features = [
    { key: 'fontOptimize', cls: CLASSES.font },
    { key: 'roundCards', cls: CLASSES.roundCards },
    { key: 'focusGlow', cls: CLASSES.focusGlow },
    { key: 'scrollbar', cls: CLASSES.scrollbar },
    { key: 'readWidth', cls: CLASSES.readWidth },
    { key: 'darkMode', cls: CLASSES.darkMode }
  ];
  features.forEach(f => html.classList.toggle(f.cls, !!settings[f.key]));

  const css = buildCss();

  // 重新生成
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = css;
  (document.head || document.documentElement).appendChild(s);

  ATTR_EL.setAttribute('data-wb-theme', settings.darkMode ? 'dark' : 'light');
  if (settings.darkMode) ATTR_EL.setAttribute('data-wb-dark', 'true');
  else ATTR_EL.removeAttribute('data-wb-dark');
}

function buildCss() {
  const parts = [];
  const { fontOptimize, darkMode, darkStrength, roundCards, focusGlow, contrast, saturation, scrollbar, readWidth } = settings;
  const contrastPct = clamp(contrast, 80, 130);
  const satPct = clamp(saturation, 80, 140);

  if (fontOptimize) {
    parts.push(`
      html.web-beautifier-on, html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
      body { letter-spacing: 0.01em; line-height: 1.65; }
      p, li, td, th { line-height: 1.65; }
    `);
  }

  if (roundCards) {
    parts.push(`
      html.web-beautifier-round button, html.web-beautifier-round .btn,
      html.web-beautifier-round input, html.web-beautifier-round select, html.web-beautifier-round textarea,
      html.web-beautifier-round [class*="card"], html.web-beautifier-round article,
      html.web-beautifier-round [role="dialog"] {
        border-radius: max(8px, 0.5em) !important;
      }
    `);
  }

  if (focusGlow) {
    parts.push(`
      html.web-beautifier-focus a:focus-visible, html.web-beautifier-focus button:focus-visible,
      html.web-beautifier-focus input:focus-visible, html.web-beautifier-focus [tabindex]:focus-visible {
        outline: 2px solid #4f8cff !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px rgba(79,140,255,0.25) !important;
      }
    `);
  }

  if (scrollbar) {
    parts.push(`
      html.web-beautifier-scroll ::-webkit-scrollbar { width: 10px; height: 10px; }
      html.web-beautifier-scroll ::-webkit-scrollbar-track { background: transparent; }
      html.web-beautifier-scroll ::-webkit-scrollbar-thumb {
        background: rgba(110,120,140,0.5); border-radius: 8px; border: 2px solid transparent; background-clip: content-box;
      }
      html.web-beautifier-scroll ::-webkit-scrollbar-thumb:hover { background: rgba(80,90,110,0.8); background-clip: content-box; }
    `);
  }

  if (readWidth) {
    parts.push(`
      html.web-beautifier-read article, html.web-beautifier-read main, html.web-beautifier-read .content {
        max-width: 720px !important; margin-left: auto !important; margin-right: auto !important;
      }
    `);
  }

  // 对比度 / 饱和度是否需要叠加在根 filter 上
  const csFilter = (contrast != 100 || saturation != 100)
    ? ` contrast(${contrastPct}%) saturate(${satPct}%)`
    : '';

  // ============ 暗色模式 ============
  if (darkMode) {
    parts.push(DarkCss(csFilter));
    TagMedia();
  } else if (csFilter) {
    // 非暗色时，对比度/饱和度单独作用在根元素
    parts.push(`html { filter:${csFilter.replace(/^\s/, '')}; }`);
  }

  return parts.join('\n');
}

/**
 * 暗色模式：反转 + 媒体还原 的经典技巧。
 * 把 <html> 整体反转（背景变深、文字变浅），再把图片/视频再反转还原成真实颜色。
 * @param {string} extraFilter 需与反转一同作用在根元素的额外滤镜（如对比度/饱和度）
 */
function DarkCss(extraFilter = '') {
  const dark = clamp(settings.darkStrength, 10, 120) / 100;   // 0.1 ~ 1.2
  const inv = (0.65 + dark * 0.35).toFixed(3);                // 反转强度
  const rootFilter = `invert(${inv}) hue-rotate(180deg)${extraFilter}`;
  const mediaFilter = `invert(${inv}) hue-rotate(180deg)`;
  return `
    html.web-beautifier-dark {
      filter:${rootFilter} !important;
    }
    html.web-beautifier-dark img.wb-dark,
    html.web-beautifier-dark video.wb-dark,
    html.web-beautifier-dark canvas.wb-dark,
    html.web-beautifier-dark iframe.wb-dark,
    html.web-beautifier-dark [style*="background-image"] {
      filter:${mediaFilter} !important;
    }
  `;
}

// ============ 暗色模式媒体处理 ============
// 给已经在页面上以及动态加载的 img/video/canvas/iframe 打上 wb-dark 类，
// 使它们在被根元素整体反转后能再还原成真实颜色。
function TagMedia() {
  document.querySelectorAll('img, video, canvas, iframe').forEach(el => el.classList.add('wb-dark'));
  // 动态内容处理
  if (!_observer) {
    _observer = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type !== 'childList' || !m.addedNodes) continue;
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue;
          n.querySelectorAll && n.querySelectorAll('img, video, canvas, iframe').forEach(el => el.classList.add('wb-dark'));
        }
      }
    });
  }
  _observer.observe(document.documentElement, { childList: true, subtree: true });
}

// 若暗色关闭，断开观察器
function UntagMedia() {
  if (_observer) { _observer.disconnect(); _observer = null; }
  document.querySelectorAll('img.wb-dark, video.wb-dark, canvas.wb-dark, iframe.wb-dark')
    .forEach(el => el.classList.remove('wb-dark'));
}