# AI网页助手 Chrome插件

这是一个Chrome浏览器插件，可以在打开网页时调用AI大模型阅读网页内容，并在网页右侧边栏提供对话框回答用户提问。

## 功能特点

- 自动读取当前网页内容
- 在网页右侧显示交互式对话框
- 调用AI大模型回答与网页内容相关的问题
- 保存对话历史
- 支持自定义API设置

## 项目结构

```
ai-web-assistant/
├── manifest.json           # 插件配置文件
├── background.js           # 背景脚本
├── content/                # 内容脚本和样式
│   ├── content.js          # 主要内容脚本
│   ├── sidebar.js          # 侧边栏功能
│   └── styles.css          # 样式文件
├── popup/                  # 弹出窗口
│   ├── popup.html          # 弹出窗口HTML
│   ├── popup.js            # 弹出窗口脚本
│   └── popup.css           # 弹出窗口样式
├── options/                # 选项页面
│   ├── options.html        # 选项页面HTML
│   ├── options.js          # 选项页面脚本
│   └── options.css         # 选项页面样式
├── lib/                    # 库文件
│   └── api.js              # AI API调用函数
├── assets/                 # 资源文件
│   └── icons/              # 图标文件
│       ├── icon16.png      # 16x16图标
│       ├── icon48.png      # 48x48图标
│       └── icon128.png     # 128x128图标
└── package.json            # 项目依赖配置
```

## 开发环境搭建

请按照以下步骤设置开发环境：

1. 安装Node.js和npm
2. 克隆此仓库
3. 运行`npm install`安装依赖
4. 在Chrome中加载插件进行测试

## 如何使用

1. 在Chrome中安装此插件
2. 在选项页面配置您的AI API密钥
3. 浏览任意网页，点击插件图标激活侧边栏
4. 在对话框中提问与网页内容相关的问题

## 技术栈

- JavaScript (ES6+)
- HTML5 & CSS3
- Chrome Extension API
- 第三方AI API (如OpenAI、Google Gemini等)
