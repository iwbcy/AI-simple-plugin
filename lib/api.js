/**
 * AI网页助手 - API库
 * 
 * 提供与各种AI服务提供商通信的函数
 */

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
      temperature: settings.temperature || 0.7,
      max_tokens: settings.maxTokens || 1000
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
 * 调用Google AI API
 * @param {Object} data - 查询数据
 * @param {Object} settings - API设置
 * @returns {Promise<Object>} - API响应
 */
async function callGoogleAI(data, settings) {
  const { query, pageContent, conversation } = data;
  
  // 构建请求内容
  let prompt = `网页内容:\n${pageContent}\n\n`;
  
  // 添加历史对话
  if (conversation && conversation.length > 0) {
    prompt += "历史对话:\n";
    conversation.forEach(msg => {
      prompt += `${msg.isUser ? '用户' : 'AI'}: ${msg.text}\n`;
    });
  }
  
  // 添加当前查询
  prompt += `\n用户问题: ${query}`;
  
  // 调用Google AI API
  // 注意：这是一个示例实现，实际的Google AI API可能有不同的接口
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': settings.apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: settings.temperature || 0.7,
        maxOutputTokens: settings.maxTokens || 1000
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '调用Google AI API时出错');
  }
  
  const result = await response.json();
  return {
    text: result.candidates[0].content.parts[0].text,
    provider: 'google'
  };
}

/**
 * 调用Anthropic Claude API
 * @param {Object} data - 查询数据
 * @param {Object} settings - API设置
 * @returns {Promise<Object>} - API响应
 */
async function callAnthropic(data, settings) {
  const { query, pageContent, conversation } = data;
  
  // 构建系统提示
  const systemPrompt = `你是一个网页内容助手。你的任务是基于用户正在浏览的网页内容回答问题。如果问题与网页内容无关，请礼貔地告知用户你只能回答与当前网页相关的问题。`;
  
  // 构建用户消息
  let userMessage = `网页内容:\n${pageContent}\n\n`;
  
  // 添加历史对话
  if (conversation && conversation.length > 0) {
    userMessage += "历史对话:\n";
    conversation.forEach(msg => {
      userMessage += `${msg.isUser ? '用户' : 'AI'}: ${msg.text}\n`;
    });
  }
  
  // 添加当前查询
  userMessage += `\n我的问题是: ${query}`;
  
  // 调用Anthropic API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: settings.model,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: settings.maxTokens || 1000,
      temperature: settings.temperature || 0.7
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '调用Anthropic API时出错');
  }
  
  const result = await response.json();
  return {
    text: result.content[0].text,
    provider: 'anthropic'
  };
}

// 导出函数
export { callOpenAI, callGoogleAI, callAnthropic };
