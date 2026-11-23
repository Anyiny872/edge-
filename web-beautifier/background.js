/**
 * 网页美化师 · WebBeautifier — Background Service Worker
 * 负责初始化默认设置，并在安装/更新时应用。
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

// 首次安装：写入默认设置
chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.sync.get(DEFAULTS, (cur) => {
    // 只补填写缺省项，不覆盖用户已保存的值
    chrome.storage.sync.set({ ...DEFAULTS, ...cur });
  });
  if (details.reason === 'install') {
    console.log('[WebBeautifier] 已安装，默认美化已启用。可在插件面板调整。');
  }
});

// 让 Service Worker 保持活跃以便监听（可选）
chrome.runtime.onStartup.addListener(() => {
  // 无需特殊处理
});