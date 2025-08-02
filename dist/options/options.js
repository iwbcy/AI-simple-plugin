/******/ (() => { // webpackBootstrap
/**
 * AI网页助手 - 选项页面脚本
 */

// 默认设置
const DEFAULT_SETTINGS = {
  apiKey: '',
  apiProvider: 'openai',
  model: 'gpt-3.5-turbo',
  theme: 'light',
  autoOpenSidebar: false,
  saveHistory: true,
  maxTokens: 1000,
  temperature: 0.7
};

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 获取DOM元素
  const apiProviderSelect = document.getElementById('api-provider');
  const apiKeyInput = document.getElementById('api-key');
  const toggleApiKeyBtn = document.getElementById('toggle-api-key');
  const apiHelpLink = document.getElementById('api-help-link');
  const modelSelect = document.getElementById('model-selection');
  const themeSelect = document.getElementById('theme-selection');
  const autoOpenSidebarCheckbox = document.getElementById('auto-open-sidebar');
  const saveHistoryCheckbox = document.getElementById('save-history');
  const maxTokensRange = document.getElementById('max-tokens');
  const maxTokensValue = document.getElementById('max-tokens-value');
  const temperatureRange = document.getElementById('temperature');
  const temperatureValue = document.getElementById('temperature-value');
  const saveButton = document.getElementById('save-button');
  const resetButton = document.getElementById('reset-button');
  const statusMessage = document.getElementById('status-message');
  
  // 加载保存的设置
  loadSettings();
  
  // 添加事件监听器
  
  // API提供商变更时更新模型选项
  apiProviderSelect.addEventListener('change', updateModelOptions);
  
  // 切换API密钥可见性
  toggleApiKeyBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleApiKeyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path></svg>';
    } else {
      apiKeyInput.type = 'password';
      toggleApiKeyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>';
    }
  });
  
  // API帮助链接
  apiHelpLink.addEventListener('click', (e) => {
    e.preventDefault();
    showApiHelp(apiProviderSelect.value);
  });
  
  // 范围滑块值更新
  maxTokensRange.addEventListener('input', () => {
    maxTokensValue.textContent = maxTokensRange.value;
  });
  
  temperatureRange.addEventListener('input', () => {
    temperatureValue.textContent = temperatureRange.value;
  });
  
  // 保存按钮
  saveButton.addEventListener('click', saveSettings);
  
  // 重置按钮
  resetButton.addEventListener('click', () => {
    if (confirm('确定要恢复默认设置吗？这将覆盖您的所有自定义设置。')) {
      resetSettings();
    }
  });
});

/**
 * 加载保存的设置
 */
function loadSettings() {
  chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS), (result) => {
    // 合并默认设置和保存的设置
    const settings = { ...DEFAULT_SETTINGS, ...result };
    
    // 更新UI元素
    document.getElementById('api-provider').value = settings.apiProvider;
    document.getElementById('api-key').value = settings.apiKey;
    updateModelOptions(); // 更新模型选项
    document.getElementById('model-selection').value = settings.model;
    document.getElementById('theme-selection').value = settings.theme;
    document.getElementById('auto-open-sidebar').checked = settings.autoOpenSidebar;
    document.getElementById('save-history').checked = settings.saveHistory;
    document.getElementById('max-tokens').value = settings.maxTokens;
    document.getElementById('max-tokens-value').textContent = settings.maxTokens;
    document.getElementById('temperature').value = settings.temperature;
    document.getElementById('temperature-value').textContent = settings.temperature;
  });
}

/**
 * 保存设置
 */
function saveSettings() {
  const settings = {
    apiKey: document.getElementById('api-key').value,
    apiProvider: document.getElementById('api-provider').value,
    model: document.getElementById('model-selection').value,
    theme: document.getElementById('theme-selection').value,
    autoOpenSidebar: document.getElementById('auto-open-sidebar').checked,
    saveHistory: document.getElementById('save-history').checked,
    maxTokens: parseInt(document.getElementById('max-tokens').value),
    temperature: parseFloat(document.getElementById('temperature').value)
  };
  
  // 保存到Chrome存储
  chrome.storage.sync.set(settings, () => {
    // 显示成功消息
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = '设置已保存！';
    statusMessage.className = 'status-message success';
    
    // 3秒后隐藏消息
    setTimeout(() => {
      statusMessage.textContent = '';
      statusMessage.className = 'status-message';
    }, 3000);
  });
}

/**
 * 重置设置为默认值
 */
function resetSettings() {
  // 重置UI元素
  document.getElementById('api-provider').value = DEFAULT_SETTINGS.apiProvider;
  document.getElementById('api-key').value = DEFAULT_SETTINGS.apiKey;
  updateModelOptions(); // 更新模型选项
  document.getElementById('model-selection').value = DEFAULT_SETTINGS.model;
  document.getElementById('theme-selection').value = DEFAULT_SETTINGS.theme;
  document.getElementById('auto-open-sidebar').checked = DEFAULT_SETTINGS.autoOpenSidebar;
  document.getElementById('save-history').checked = DEFAULT_SETTINGS.saveHistory;
  document.getElementById('max-tokens').value = DEFAULT_SETTINGS.maxTokens;
  document.getElementById('max-tokens-value').textContent = DEFAULT_SETTINGS.maxTokens;
  document.getElementById('temperature').value = DEFAULT_SETTINGS.temperature;
  document.getElementById('temperature-value').textContent = DEFAULT_SETTINGS.temperature;
  
  // 保存默认设置
  chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
    // 显示成功消息
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = '已恢复默认设置！';
    statusMessage.className = 'status-message success';
    
    // 3秒后隐藏消息
    setTimeout(() => {
      statusMessage.textContent = '';
      statusMessage.className = 'status-message';
    }, 3000);
  });
}

/**
 * 根据API提供商更新模型选项
 */
function updateModelOptions() {
  const apiProvider = document.getElementById('api-provider').value;
  const modelSelect = document.getElementById('model-selection');
  
  // 清空现有选项
  modelSelect.innerHTML = '';
  
  // 根据API提供商添加相应的模型选项
  switch (apiProvider) {
    case 'openai':
      addOption(modelSelect, 'gpt-3.5-turbo', 'GPT-3.5 Turbo');
      addOption(modelSelect, 'gpt-4', 'GPT-4');
      addOption(modelSelect, 'gpt-4-turbo', 'GPT-4 Turbo');
      break;
    case 'google':
      addOption(modelSelect, 'gemini-pro', 'Gemini Pro');
      addOption(modelSelect, 'gemini-ultra', 'Gemini Ultra');
      break;
    case 'anthropic':
      addOption(modelSelect, 'claude-2', 'Claude 2');
      addOption(modelSelect, 'claude-instant', 'Claude Instant');
      break;
    case 'baidu':
      addOption(modelSelect, 'ernie-bot-4', 'ERNIE Bot 4.0');
      addOption(modelSelect, 'ernie-bot', 'ERNIE Bot');
      addOption(modelSelect, 'ernie-bot-lite', 'ERNIE Bot Lite');
      break;
    case 'zhipu':
      addOption(modelSelect, 'glm-4', 'GLM-4');
      addOption(modelSelect, 'glm-3-turbo', 'GLM-3-Turbo');
      break;
    case 'moonshot':
      addOption(modelSelect, 'moonshot-v1-8k', 'Moonshot V1-8K');
      addOption(modelSelect, 'moonshot-v1-32k', 'Moonshot V1-32K');
      addOption(modelSelect, 'moonshot-v1-128k', 'Moonshot V1-128K');
      break;
  }
}

/**
 * 添加选项到选择框
 * @param {HTMLSelectElement} selectElement - 选择框元素
 * @param {string} value - 选项值
 * @param {string} text - 选项文本
 */
function addOption(selectElement, value, text) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  selectElement.appendChild(option);
}

/**
 * 显示API帮助信息
 * @param {string} provider - API提供商
 */
function showApiHelp(provider) {
  let helpUrl = '';
  
  switch (provider) {
    case 'openai':
      helpUrl = 'https://platform.openai.com/account/api-keys';
      break;
    case 'google':
      helpUrl = 'https://ai.google.dev/tutorials/setup';
      break;
    case 'anthropic':
      helpUrl = 'https://console.anthropic.com/account/keys';
      break;
    case 'baidu':
      helpUrl = 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Dlmogdmgf';
      break;
    case 'zhipu':
      helpUrl = 'https://open.bigmodel.cn/dev/api#auth';
      break;
    case 'moonshot':
      helpUrl = 'https://platform.moonshot.cn/console/api-keys';
      break;
  }
  
  if (helpUrl) {
    chrome.tabs.create({ url: helpUrl });
  }
}

/******/ })()
;