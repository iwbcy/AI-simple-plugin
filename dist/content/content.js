/******/ (() => { // webpackBootstrap
/**
 * AI网页助手 - 内容脚本
 * 
 * 负责在网页中注入侧边栏UI并与背景脚本通信
 */

// 全局变量
let sidebar = null;
let sidebarVisible = false;
let pageContent = '';
let conversation = [];

// 在页面加载完成后初始化
window.addEventListener('load', async () => {
  // 检查是否启用了侧边栏
  const settings = await getSettings();
  if (settings.sidebarEnabled) {
    // 提取网页内容
    extractPageContent();
    // 创建侧边栏
    createSidebar();
  }
});

// 监听来自背景脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'toggleSidebar':
      if (message.enabled) {
        if (!sidebar) {
          extractPageContent();
          createSidebar();
        } else {
          toggleSidebar(true);
        }
      } else {
        toggleSidebar(false);
      }
      sendResponse({ success: true });
      break;
      
    case 'aiResponse':
      // 处理AI响应
      handleAIResponse(message.data);
      sendResponse({ success: true });
      break;
  }
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
 * 提取网页内容
 */
function extractPageContent() {
  // 获取主要内容
  // 这里使用一个简单的算法来提取页面主要内容
  // 实际应用中可能需要更复杂的算法
  
  // 移除不需要的元素
  const elementsToIgnore = [
    'script', 'style', 'noscript', 'iframe', 'img', 'svg',
    'nav', 'footer', 'header', 'aside', 'form'
  ];
  
  // 创建页面的克隆以便操作
  const clone = document.cloneNode(true);
  const body = clone.body;
  
  // 移除不需要的元素
  elementsToIgnore.forEach(tag => {
    const elements = body.getElementsByTagName(tag);
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].parentNode.removeChild(elements[i]);
    }
  });
  
  // 获取标题
  let title = document.title || '';
  
  // 获取主要内容
  // 首先尝试找到主要内容区域
  let mainContent = '';
  const possibleContentElements = [
    document.querySelector('article'),
    document.querySelector('main'),
    document.querySelector('#content'),
    document.querySelector('.content'),
    document.querySelector('#main'),
    document.querySelector('.main')
  ].filter(el => el !== null);
  
  if (possibleContentElements.length > 0) {
    // 使用找到的第一个主要内容元素
    mainContent = possibleContentElements[0].innerText;
  } else {
    // 如果没有找到明确的主要内容元素，使用整个body
    mainContent = body.innerText;
  }
  
  // 清理文本
  mainContent = mainContent
    .replace(/\s+/g, ' ')  // 替换多个空白字符为单个空格
    .trim();
  
  // 限制内容长度，避免发送过多数据
  const maxLength = 8000;
  if (mainContent.length > maxLength) {
    mainContent = mainContent.substring(0, maxLength) + '...（内容已截断）';
  }
  
  // 组合页面内容
  pageContent = `标题: ${title}\n\n内容:\n${mainContent}`;
}

/**
 * 创建侧边栏
 */
function createSidebar() {
  // 检查侧边栏是否已存在
  if (sidebar) {
    toggleSidebar(true);
    return;
  }
  
  // 创建侧边栏容器
  sidebar = document.createElement('div');
  sidebar.id = 'ai-web-assistant-sidebar';
  sidebar.classList.add('ai-web-assistant-sidebar');
  
  // 创建侧边栏内容
  sidebar.innerHTML = `
    <div class="ai-sidebar-header">
      <h3>AI网页助手</h3>
      <button class="ai-sidebar-close-btn" title="关闭侧边栏">×</button>
    </div>
    <div class="ai-sidebar-conversation">
      <div class="ai-welcome-message">
        <p>👋 你好！我是AI网页助手。</p>
        <p>我已经阅读了这个网页的内容，你可以问我任何关于这个网页的问题。</p>
      </div>
      <div class="ai-messages-container"></div>
    </div>
    <div class="ai-sidebar-input">
      <textarea placeholder="输入你的问题..." rows="2"></textarea>
      <button class="ai-send-btn" title="发送">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
        </svg>
      </button>
    </div>
  `;
  
  // 添加到文档
  document.body.appendChild(sidebar);
  
  // 添加事件监听器
  const closeBtn = sidebar.querySelector('.ai-sidebar-close-btn');
  closeBtn.addEventListener('click', () => toggleSidebar(false));
  
  const textarea = sidebar.querySelector('textarea');
  const sendBtn = sidebar.querySelector('.ai-send-btn');
  
  // 发送按钮点击事件
  sendBtn.addEventListener('click', () => {
    const query = textarea.value.trim();
    if (query) {
      sendQuery(query);
      textarea.value = '';
    }
  });
  
  // 文本框按键事件 (按Enter发送)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const query = textarea.value.trim();
      if (query) {
        sendQuery(query);
        textarea.value = '';
      }
    }
  });
  
  // 显示侧边栏
  toggleSidebar(true);
}

/**
 * 切换侧边栏显示状态
 * @param {boolean} show - 是否显示侧边栏
 */
function toggleSidebar(show) {
  if (!sidebar) return;
  
  sidebarVisible = show;
  
  if (show) {
    sidebar.classList.add('visible');
    // 调整页面布局以适应侧边栏
    document.body.classList.add('ai-sidebar-active');
  } else {
    sidebar.classList.remove('visible');
    // 恢复页面布局
    document.body.classList.remove('ai-sidebar-active');
  }
}

/**
 * 发送查询到背景脚本
 * @param {string} query - 用户查询
 */
function sendQuery(query) {
  // 添加用户消息到对话
  addMessage(query, true);
  
  // 显示加载指示器
  showLoadingIndicator();
  
  // 发送消息到背景脚本
  chrome.runtime.sendMessage({
    action: 'queryAI',
    data: {
      query,
      pageContent,
      conversation,
      url: window.location.href,
      title: document.title
    }
  }, response => {
    // 隐藏加载指示器
    hideLoadingIndicator();
    
    if (response.error) {
      // 显示错误消息
      addMessage(`错误: ${response.error}`, false, true);
    }
  });
}

/**
 * 处理AI响应
 * @param {Object} data - 响应数据
 */
function handleAIResponse(data) {
  if (data.text) {
    // 添加AI回答到对话
    addMessage(data.text, false);
    
    // 保存对话历史
    saveConversation();
  }
}

/**
 * 添加消息到对话
 * @param {string} text - 消息文本
 * @param {boolean} isUser - 是否是用户消息
 * @param {boolean} isError - 是否是错误消息
 */
function addMessage(text, isUser, isError = false) {
  if (!sidebar) return;
  
  // 创建消息元素
  const messageEl = document.createElement('div');
  messageEl.classList.add('ai-message');
  messageEl.classList.add(isUser ? 'ai-user-message' : 'ai-assistant-message');
  if (isError) messageEl.classList.add('ai-error-message');
  
  // 设置消息内容
  messageEl.innerHTML = `
    <div class="ai-message-content">
      ${formatMessage(text)}
    </div>
    ${!isUser ? '<button class="ai-copy-btn" title="复制回答">复制</button>' : ''}
  `;
  
  // 添加到消息容器
  const messagesContainer = sidebar.querySelector('.ai-messages-container');
  messagesContainer.appendChild(messageEl);
  
  // 滚动到底部
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // 添加复制按钮事件
  if (!isUser) {
    const copyBtn = messageEl.querySelector('.ai-copy-btn');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '已复制';
        setTimeout(() => {
          copyBtn.textContent = '复制';
        }, 2000);
      });
    });
  }
  
  // 添加到对话历史
  if (!isError) {
    conversation.push({ text, isUser });
  }
}

/**
 * 格式化消息文本
 * @param {string} text - 原始文本
 * @returns {string} - 格式化后的HTML
 */
function formatMessage(text) {
  // 简单的Markdown格式支持
  return text
    // 代码块
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 粗体
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // 换行
    .replace(/\n/g, '<br>');
}

/**
 * 显示加载指示器
 */
function showLoadingIndicator() {
  if (!sidebar) return;
  
  // 检查是否已存在加载指示器
  let loadingEl = sidebar.querySelector('.ai-loading-indicator');
  if (loadingEl) return;
  
  // 创建加载指示器
  loadingEl = document.createElement('div');
  loadingEl.classList.add('ai-message', 'ai-assistant-message', 'ai-loading-indicator');
  loadingEl.innerHTML = `
    <div class="ai-message-content">
      <div class="ai-typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  // 添加到消息容器
  const messagesContainer = sidebar.querySelector('.ai-messages-container');
  messagesContainer.appendChild(loadingEl);
  
  // 滚动到底部
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * 隐藏加载指示器
 */
function hideLoadingIndicator() {
  if (!sidebar) return;
  
  const loadingEl = sidebar.querySelector('.ai-loading-indicator');
  if (loadingEl) {
    loadingEl.remove();
  }
}

/**
 * 保存对话历史
 */
function saveConversation() {
  chrome.runtime.sendMessage({
    action: 'saveConversation',
    data: {
      url: window.location.href,
      title: document.title,
      conversation
    }
  });
}

/******/ })()
;