/**
 * AI网页助手 - 弹出窗口脚本
 */

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 获取DOM元素
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const apiStatus = document.getElementById('api-status');
  const currentModel = document.getElementById('current-model');
  const openOptionsBtn = document.getElementById('open-options');
  const clearHistoryBtn = document.getElementById('clear-history');
  const helpBtn = document.getElementById('help-button');
  const feedbackBtn = document.getElementById('feedback-button');
  const historyList = document.getElementById('history-list');
  
  // 获取用户设置
  const settings = await getSettings();
  
  // 设置侧边栏开关状态
  sidebarToggle.checked = settings.sidebarEnabled;
  
  // 显示当前模型
  currentModel.textContent = settings.model || '-';
  
  // 检查API状态
  checkAPIStatus(settings, apiStatus);
  
  // 加载对话历史
  loadConversationHistory(historyList);
  
  // 添加事件监听器
  
  // 侧边栏开关
  sidebarToggle.addEventListener('change', () => {
    toggleSidebar(sidebarToggle.checked);
  });
  
  // 打开选项页面
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // 清除历史
  clearHistoryBtn.addEventListener('click', () => {
    clearConversationHistory();
    loadConversationHistory(historyList);
  });
  
  // 帮助按钮
  helpBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/yourusername/ai-web-assistant/wiki' });
  });
  
  // 反馈按钮
  feedbackBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/yourusername/ai-web-assistant/issues' });
  });
});

/**
 * 获取用户设置
 * @returns {Promise<Object>} 用户设置
 */
async function getSettings() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'getSettings' }, response => {
      resolve(response || {});
    });
  });
}

/**
 * 切换侧边栏显示状态
 * @param {boolean} enabled - 是否启用侧边栏
 */
function toggleSidebar(enabled) {
  // 更新设置
  chrome.storage.sync.set({ sidebarEnabled: enabled });
  
  // 向当前活动标签页发送消息
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'toggleSidebar', 
        enabled: enabled 
      });
    }
  });
}

/**
 * 检查API状态
 * @param {Object} settings - 用户设置
 * @param {HTMLElement} statusElement - 状态显示元素
 */
function checkAPIStatus(settings, statusElement) {
  if (!settings.apiKey) {
    statusElement.textContent = '未配置';
    statusElement.style.color = '#EA4335';
    return;
  }
  
  // 简单验证API密钥格式
  let isValidFormat = false;
  
  switch (settings.apiProvider) {
    case 'openai':
      isValidFormat = settings.apiKey.startsWith('sk-') && settings.apiKey.length > 20;
      break;
    case 'google':
      isValidFormat = settings.apiKey.length > 20;
      break;
    case 'anthropic':
      isValidFormat = settings.apiKey.startsWith('sk-') && settings.apiKey.length > 20;
      break;
    default:
      isValidFormat = false;
  }
  
  if (isValidFormat) {
    statusElement.textContent = '已配置';
    statusElement.style.color = '#34A853';
  } else {
    statusElement.textContent = '密钥格式错误';
    statusElement.style.color = '#EA4335';
  }
}

/**
 * 加载对话历史
 * @param {HTMLElement} historyListElement - 历史列表元素
 */
function loadConversationHistory(historyListElement) {
  chrome.storage.local.get('conversationHistory', (result) => {
    const history = result.conversationHistory || [];
    
    // 清空历史列表
    historyListElement.innerHTML = '';
    
    if (history.length === 0) {
      historyListElement.innerHTML = '<div class="empty-history">暂无对话历史</div>';
      return;
    }
    
    // 显示最近的5条历史记录
    const recentHistory = history
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 5);
    
    recentHistory.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.classList.add('history-item');
      
      // 格式化日期
      const date = new Date(item.lastUpdated);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      
      historyItem.innerHTML = `
        <div class="history-title">${item.title || '未命名页面'}</div>
        <div class="history-date">${formattedDate}</div>
      `;
      
      // 点击历史项打开相应的页面
      historyItem.addEventListener('click', () => {
        chrome.tabs.create({ url: item.url });
      });
      
      historyListElement.appendChild(historyItem);
    });
  });
}

/**
 * 清除对话历史
 */
function clearConversationHistory() {
  if (confirm('确定要清除所有对话历史吗？')) {
    chrome.storage.local.remove('conversationHistory', () => {
      console.log('对话历史已清除');
    });
  }
}
