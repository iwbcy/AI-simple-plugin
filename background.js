/**
 * AI网页助手 - 背景脚本
 * 
 * 负责处理插件的后台逻辑，包括：
 * - 管理与AI API的连接
 * - 处理来自内容脚本的消息
 * - 管理用户设置和存储
 */

// 插件安装或更新时的处理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装时初始化设置
    chrome.storage.sync.set({
      apiKey: '',
      apiProvider: 'openai',
      model: 'gpt-3.5-turbo',
      sidebarEnabled: true,
      theme: 'light'
    }, () => {
      console.log('AI网页助手已安装并初始化设置');
      // 安装后打开选项页面引导用户设置API密钥
      chrome.runtime.openOptionsPage();
    });
  } else if (details.reason === 'update') {
    console.log('AI网页助手已更新到版本 ' + chrome.runtime.getManifest().version);
  }
});

// 监听来自内容脚本和弹出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 根据消息类型处理不同的请求
  switch (message.action) {
    case 'getSettings':
      // 获取用户设置
      chrome.storage.sync.get(['apiKey', 'apiProvider', 'model', 'sidebarEnabled', 'theme'], (result) => {
        sendResponse(result);
      });
      return true; // 异步响应需要返回true

    case 'toggleSidebar':
      // 切换侧边栏显示状态
      chrome.storage.sync.get('sidebarEnabled', (result) => {
        const newState = !result.sidebarEnabled;
        chrome.storage.sync.set({ sidebarEnabled: newState }, () => {
          // 向当前活动标签页发送消息
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleSidebar', enabled: newState });
            }
          });
          sendResponse({ success: true, enabled: newState });
        });
      });
      return true;

    case 'queryAI':
      // 处理AI查询请求
      handleAIQuery(message.data, sender.tab?.id).then(response => {
        sendResponse(response);
      }).catch(error => {
        sendResponse({ error: error.message });
      });
      return true;

    case 'saveConversation':
      // 保存对话历史
      saveConversation(message.data).then(() => {
        sendResponse({ success: true });
      }).catch(error => {
        sendResponse({ error: error.message });
      });
      return true;
  }
});

/**
 * 处理AI查询请求
 * @param {Object} data - 包含查询文本和网页内容的对象
 * @param {number} tabId - 发送请求的标签页ID
 * @returns {Promise<Object>} - AI响应
 */
async function handleAIQuery(data, tabId) {
  try {
    // 获取API设置
    const settings = await new Promise(resolve => {
      chrome.storage.sync.get(['apiKey', 'apiProvider', 'model'], resolve);
    });

    // 检查API密钥是否已设置
    if (!settings.apiKey) {
      throw new Error('请在选项页面设置您的API密钥');
    }

    // 根据不同的API提供商调用相应的函数
    let response;
    switch (settings.apiProvider) {
      case 'openai':
        response = await callOpenAI(data, settings);
        break;
      case 'google':
        response = await callGoogleAI(data, settings);
        break;
      case 'anthropic':
        response = await callAnthropic(data, settings);
        break;
      case 'baidu':
        response = await callBaiduAI(data, settings);
        break;
      case 'zhipu':
        response = await callZhipuAI(data, settings);
        break;
      case 'moonshot':
        response = await callMoonshotAI(data, settings);
        break;
      default:
        throw new Error('不支持的API提供商');
    }

    // 向内容脚本发送处理结果
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: 'aiResponse',
        data: response
      });
    }

    return response;
  } catch (error) {
    console.error('AI查询错误:', error);
    throw error;
  }
}

/**
 * 调用OpenAI API
 * @param {Object} data - 查询数据
 * @param {Object} settings - API设置
 * @returns {Promise<Object>} - API响应
 */
async function callOpenAI(data, settings) {
  const { query, pageContent, conversation } = data;
  
  // 准备发送给API的消息
  const messages = [];
  
  // 添加系统消息，提供上下文
  messages.push({
    role: 'system',
    content: `你是一个网页内容助手。你的任务是基于用户正在浏览的网页内容回答问题。以下是当前网页的内容:\n\n${pageContent}\n\n请基于上述网页内容回答用户的问题。如果问题与网页内容无关，请礼貌地告知用户你只能回答与当前网页相关的问题。`
  });
  
  // 添加历史对话
  if (conversation && conversation.length > 0) {
    conversation.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      });
    });
  }
  
  // 添加当前查询
  messages.push({
    role: 'user',
    content: query
  });
  
  // 调用API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '调用OpenAI API时出错');
  }
  
  const result = await response.json();
  return {
    text: result.choices[0].message.content,
    provider: 'openai'
  };
}

/**
 * 调用Google AI API (示例实现)
 * @param {Object} data - 查询数据
 * @param {Object} settings - API设置
 * @returns {Promise<Object>} - API响应
 */
async function callGoogleAI(data, settings) {
  // 这里是Google AI API的实现
  // 实际实现需要根据Google的API文档进行开发
  throw new Error('Google AI API尚未实现');
}

/**
 * 调用Anthropic Claude API (示例实现)
 * @param {Object} data - 查询数据
 * @param {Object} settings - API设置
 * @returns {Promise<Object>} - API响应
 */
async function callAnthropic(data, settings) {
  // 这里是Anthropic Claude API的实现
  // 实际实现需要根据Anthropic的API文档进行开发
  throw new Error('Anthropic API尚未实现');
}

/**
 * 调用百度文心一言 API
 * @param {Object} data - 查询数据
 * @param {Object} settings - API设置
 * @returns {Promise<Object>} - API响应
 */
async function callBaiduAI(data, settings) {
  const { query, pageContent, conversation } = data;
  
  // 构建消息内容
  const messages = [];
  
  // 添加系统消息
  messages.push({
    role: 'system',
    content: `你是一个网页内容助手。你的任务是基于用户正在浏览的网页内容回答问题。以下是当前网页的内容:\n\n${pageContent}\n\n请基于上述网页内容回答用户的问题。如果问题与网页内容无关，请礼貌地告知用户你只能回答与当前网页相关的问题。`
  });
  
  // 添加历史对话
  if (conversation && conversation.length > 0) {
    conversation.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      });
    });
  }
  
  // 添加当前查询
  messages.push({
    role: 'user',
    content: query
  });
  
  // 获取访问令牌
  const tokenUrl = 'https://aip.baidubce.com/oauth/2.0/token';
  const tokenParams = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: settings.apiKey.split(':')[0], // 假设用户以 API_KEY:SECRET_KEY 的格式存储
    client_secret: settings.apiKey.split(':')[1]
  });
  
  const tokenResponse = await fetch(`${tokenUrl}?${tokenParams}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  if (!tokenResponse.ok) {
    throw new Error('获取百度访问令牌失败');
  }
  
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  
  // 调用百度文心API
  const apiUrl = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${settings.model}`;
  
  const response = await fetch(`${apiUrl}?access_token=${accessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: messages,
      temperature: settings.temperature || 0.7,
      top_p: 0.8,
      stream: false
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_msg || '调用百度文心API时出错');
  }
  
  const result = await response.json();
  return {
    text: result.result,
    provider: 'baidu'
  };
}

/**
 * 调用智谱 ChatGLM API
 * @param {Object} data - 查询数据
 * @param {Object} settings - API设置
 * @returns {Promise<Object>} - API响应
 */
async function callZhipuAI(data, settings) {
  const { query, pageContent, conversation } = data;
  
  // 构建消息内容
  const messages = [];
  
  // 添加系统消息
  messages.push({
    role: 'system',
    content: `你是一个网页内容助手。你的任务是基于用户正在浏览的网页内容回答问题。以下是当前网页的内容:\n\n${pageContent}\n\n请基于上述网页内容回答用户的问题。如果问题与网页内容无关，请礼貌地告知用户你只能回答与当前网页相关的问题。`
  });
  
  // 添加历史对话
  if (conversation && conversation.length > 0) {
    conversation.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      });
    });
  }
  
  // 添加当前查询
  messages.push({
    role: 'user',
    content: query
  });
  
  // 调用智谱API
  const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: messages,
      temperature: settings.temperature || 0.7,
      max_tokens: settings.maxTokens || 1000
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '调用智谱API时出错');
  }
  
  const result = await response.json();
  return {
    text: result.choices[0].message.content,
    provider: 'zhipu'
  };
}

/**
 * 调用月之暗面 Moonshot API
 * @param {Object} data - 查询数据
 * @param {Object} settings - API设置
 * @returns {Promise<Object>} - API响应
 */
async function callMoonshotAI(data, settings) {
  const { query, pageContent, conversation } = data;
  
  // 构建消息内容
  const messages = [];
  
  // 添加系统消息
  messages.push({
    role: 'system',
    content: `你是一个网页内容助手。你的任务是基于用户正在浏览的网页内容回答问题。以下是当前网页的内容:\n\n${pageContent}\n\n请基于上述网页内容回答用户的问题。如果问题与网页内容无关，请礼貌地告知用户你只能回答与当前网页相关的问题。`
  });
  
  // 添加历史对话
  if (conversation && conversation.length > 0) {
    conversation.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      });
    });
  }
  
  // 添加当前查询
  messages.push({
    role: 'user',
    content: query
  });
  
  // 调用月之暗面API
  const apiUrl = 'https://api.moonshot.cn/v1/chat/completions';
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: messages,
      temperature: settings.temperature || 0.7,
      max_tokens: settings.maxTokens || 1000
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '调用月之暗面API时出错');
  }
  
  const result = await response.json();
  return {
    text: result.choices[0].message.content,
    provider: 'moonshot'
  };
}

/**
 * 保存对话历史
 * @param {Object} data - 包含对话历史的对象
 * @returns {Promise<void>}
 */
async function saveConversation(data) {
  const { url, title, conversation } = data;
  
  // 获取现有的对话历史
  const result = await new Promise(resolve => {
    chrome.storage.local.get('conversationHistory', resolve);
  });
  
  let history = result.conversationHistory || [];
  
  // 查找是否已存在相同URL的对话
  const existingIndex = history.findIndex(item => item.url === url);
  
  if (existingIndex >= 0) {
    // 更新现有对话
    history[existingIndex].conversation = conversation;
    history[existingIndex].lastUpdated = new Date().toISOString();
  } else {
    // 添加新对话
    history.push({
      url,
      title,
      conversation,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  }
  
  // 限制历史记录数量，保留最近的50条
  if (history.length > 50) {
    history = history.sort((a, b) => 
      new Date(b.lastUpdated) - new Date(a.lastUpdated)
    ).slice(0, 50);
  }
  
  // 保存更新后的历史记录
  await new Promise(resolve => {
    chrome.storage.local.set({ conversationHistory: history }, resolve);
  });
}
