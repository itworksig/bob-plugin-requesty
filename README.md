# Bob Requesty

[Bob](https://bobtranslate.com/) 翻译插件，通过 [Requesty](https://app.requesty.ai/) 调用大语言模型翻译。接口与 OpenAI Chat Completions 兼容，默认地址是 `https://router.requesty.ai/v1`。

## 安装

1. 下载最新插件：[bob-plugin-requesty.bobplugin](https://github.com/itworksig/bob-plugin-requesty/releases/latest/download/bob-plugin-requesty.bobplugin)
2. 双击安装
3. 打开 Bob 偏好设置 → 服务 → Requesty，填入 API Key

需要指定版本时，从 [Releases](https://github.com/itworksig/bob-plugin-requesty/releases) 下载对应的 `.bobplugin`。

本地重新打包：

```bash
zip -r bob-plugin-requesty.bobplugin info.json main.js lang.js icon.png
shasum -a 256 bob-plugin-requesty.bobplugin
```

把得到的 sha256、版本说明和下载地址写进 `appcast.json`，并让 `info.json` 的 `version` 与发布标签一致。`.bobplugin` 不进 Git，只放在对应的 GitHub Release 里。

## 配置

1. 在 [app.requesty.ai](https://app.requesty.ai/) 的 API Keys 页面创建密钥
2. 在 Bob 里找到 Requesty 服务，填写：

| 选项 | 说明 |
| --- | --- |
| API Key | Requesty 的密钥 |
| API 节点 | 全球、欧盟、美国、亚太，或自定义 Base URL |
| AI Model | 预设模型，或选「自定义模型」后填写完整模型 ID |
| Prompt 模式 | 「翻译模式」使用内置提示词；「自定义模式」使用自己的 Prompt |

自定义模型也可以填 Requesty 的路由策略，例如 `policy/sonnet-with-fallback`。

自定义 Prompt 里可以用：

- `{from}`：源语言
- `{to}`：目标语言
- `{text}`：原文。写了它，整段 Prompt 会作为用户消息；没写时，Prompt 作为系统提示，原文单独发送

默认自定义 Prompt：

```text
你是一个翻译助手。请把用户文本翻译成{to}，只返回译文，不要解释。
```

## 支持的语言

与 OpenRouter 插件相同：简体中文、繁体中文、英语、日语、韩语、法语、德语、西班牙语、意大利语、俄语、葡萄牙语、荷兰语、波兰语、阿拉伯语、南非语、印地语、泰语、越南语、乌兹别克语、塔吉克语、波斯语、哈萨克语、乌尔都语、印尼语、马来语、旁遮普语、普什图语，以及自动检测。

## 预设模型

模型 ID 以 Requesty 目录为准，选「自定义模型」可以填写目录里的其他 ID。

- GPT-6 Luna `openai/gpt-6-luna`
- GPT-6 Sol `openai/gpt-6-sol`
- Claude Haiku 5.5 `anthropic/claude-haiku-5-5`
- Claude Sonnet 5.5 `anthropic/claude-sonnet-5-5`
- Claude Opus 5.5 `anthropic/claude-opus-5-5`
- Gemini 3.6 Flash `google/gemini-3.6-flash`
- DeepSeek V4.1 Flash `deepseek/deepseek-v4.1-flash`
- Qwen 3.8 Flash `alibaba/qwen3.8-flash`
- Grok 4.7 `xai/grok-4.7`

## 更新日志

### v0.1.0

- 初始版本
- 支持翻译模式和自定义 Prompt
- 语言与 OpenRouter 插件一致
- 译文按 Markdown 返回

## 相关链接

- 本仓库：https://github.com/itworksig/bob-plugin-requesty
- Requesty：https://app.requesty.ai/
- API 文档：https://docs.requesty.ai/quickstart
- Bob：https://bobtranslate.com/
