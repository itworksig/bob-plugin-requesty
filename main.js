var lang = require("./lang.js");

var API_BASES = {
    global: "https://router.requesty.ai/v1",
    eu: "https://router.eu.requesty.ai/v1",
    us: "https://router.us.requesty.ai/v1",
    ap: "https://router.ap.requesty.ai/v1"
};

function supportLanguages() {
    return lang.supportLanguages.map(([standardLang]) => standardLang);
}

function applyPromptVars(template, query) {
    const fromName = lang.langMap.get(query.detectFrom) || query.detectFrom;
    const toName = lang.langMap.get(query.detectTo) || query.detectTo;
    return String(template)
        .replace(/\{from\}/g, fromName)
        .replace(/\{to\}/g, toName)
        .replace(/\{text\}/g, query.text);
}

function buildMessages(query) {
    const mode = $option.promptMode || "translate";
    if (mode !== "custom") {
        const target = lang.langMap.get(query.detectTo) || query.detectTo;
        return {
            system: "你是一个专业的翻译助手。请准确翻译用户的文本，保持原文的意思和语气。只返回翻译结果，不要解释或添加其他内容。如果看到 HTML 或代码片段，保持其格式不变。",
            user: `将下面的文本翻译成${target}:\n\n${query.text}`
        };
    }

    const customPrompt = ($option.customPrompt || "").trim();
    if (!customPrompt) {
        return null;
    }

    if (customPrompt.indexOf("{text}") !== -1) {
        return {
            system: "请严格按照用户的提示处理文本，只返回结果，不要解释。",
            user: applyPromptVars(customPrompt, query)
        };
    }

    return {
        system: applyPromptVars(customPrompt, query),
        user: query.text
    };
}

function apiBase() {
    const region = $option.apiRegion || "global";
    if (region === "custom") {
        return String($option.customApiBase || "").trim().replace(/\/+$/, "");
    }
    return API_BASES[region] || API_BASES.global;
}

function requestHeaders(apiKey) {
    return {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bobtranslate.com",
        "X-Title": "Bob Requesty Plugin"
    };
}

function readErrorMessage(resp) {
    const data = resp && resp.data;
    if (data) {
        if (typeof data.error === "string" && data.error) {
            return data.error;
        }
        if (data.error && data.error.message) {
            return data.error.message;
        }
        if (data.message) {
            return data.message;
        }
    }
    if (resp && resp.error) {
        if (resp.error.localizedDescription) {
            return resp.error.localizedDescription;
        }
        if (resp.error.message) {
            return resp.error.message;
        }
    }
    if (resp && resp.response && resp.response.statusCode) {
        return "HTTP " + resp.response.statusCode;
    }
    return "接口响应错误";
}

function extractContent(message) {
    if (!message) {
        return "";
    }
    const content = message.content;
    if (typeof content === "string") {
        return content.trim();
    }
    if (Array.isArray(content)) {
        return content.map(function(part) {
            if (typeof part === "string") {
                return part;
            }
            if (part && typeof part.text === "string") {
                return part.text;
            }
            return "";
        }).join("").trim();
    }
    return "";
}

function fail(completion, type, message, addition) {
    const error = {
        type: type,
        message: message
    };
    if (addition) {
        error.addition = addition;
    }
    completion({ error: error });
}

function translate(query, completion) {
    if (!query || typeof query !== "object") {
        fail(completion, "param", "Invalid query object", "Query must be a valid object");
        return;
    }

    if (!query.text || typeof query.text !== "string" || query.text.trim() === "") {
        fail(completion, "param", "Invalid input text", "Input text must be a non-empty string");
        return;
    }

    if (!lang.isSupported(query.detectFrom, query.detectTo)) {
        fail(completion, "unsupportedLanguage", "不支持从 " + query.detectFrom + " 翻译到 " + query.detectTo);
        return;
    }

    const apiKey = ($option.apiKey || "").trim();
    if (!apiKey) {
        fail(completion, "secretKey", "请先配置 Requesty API Key");
        return;
    }

    const base = apiBase();
    if (!base) {
        fail(completion, "param", "请填写自定义 API Base URL");
        return;
    }

    const modelId = $option.model === "custom" ? ($option.customModel || "").trim() : $option.model;
    if (!modelId) {
        fail(completion, "param", "请选择模型或输入自定义模型 ID");
        return;
    }

    const messages = buildMessages(query);
    if (!messages) {
        fail(completion, "param", "请填写自定义 Prompt");
        return;
    }

    const body = {
        model: modelId,
        temperature: ($option.promptMode || "translate") === "custom" ? 0.7 : 0.2,
        messages: [
            {
                role: "system",
                content: messages.system
            },
            {
                role: "user",
                content: messages.user
            }
        ]
    };

    $http.request({
        method: "POST",
        url: base + "/chat/completions",
        header: requestHeaders(apiKey),
        body: body,
        handler: function(resp) {
            const statusCode = resp.response && resp.response.statusCode;
            if (resp.error || (statusCode && statusCode >= 400) || (resp.data && resp.data.error)) {
                $log.error("请求错误: " + readErrorMessage(resp));
                fail(completion, "api", readErrorMessage(resp));
                return;
            }

            try {
                const choice = resp.data && resp.data.choices && resp.data.choices[0];
                const translation = extractContent(choice && choice.message);
                if (!translation) {
                    fail(completion, "api", "模型没有返回翻译结果");
                    return;
                }
                const payload = {
                    result: {
                        from: query.detectFrom,
                        to: query.detectTo,
                        toParagraphs: [translation],
                        content: {
                            format: "markdown",
                            text: translation
                        }
                    }
                };
                if (typeof query.onCompletion === "function") {
                    query.onCompletion(payload);
                } else {
                    completion(payload);
                }
            } catch (e) {
                $log.error("解析错误: " + e.message);
                fail(completion, "unknown", "Failed to parse translation result");
            }
        }
    });
}

function pluginValidate(completion) {
    const apiKey = ($option.apiKey || "").trim();
    if (!apiKey) {
        completion({
            result: false,
            error: {
                type: "secretKey",
                message: "请先配置 Requesty API Key",
                troubleshootingLink: "https://docs.requesty.ai/quickstart"
            }
        });
        return;
    }

    const base = apiBase();
    if (!base) {
        completion({
            result: false,
            error: {
                type: "param",
                message: "请填写自定义 API Base URL"
            }
        });
        return;
    }

    $http.request({
        method: "GET",
        url: base + "/models",
        header: requestHeaders(apiKey),
        handler: function(resp) {
            const statusCode = resp.response && resp.response.statusCode;
            if (resp.error || (statusCode && statusCode >= 400) || !resp.data || resp.data.error) {
                completion({
                    result: false,
                    error: {
                        type: "api",
                        message: "API Key 验证失败，请检查是否正确",
                        addition: readErrorMessage(resp),
                        troubleshootingLink: "https://app.requesty.ai/"
                    }
                });
                return;
            }

            completion({
                result: true
            });
        }
    });
}

function pluginTimeoutInterval() {
    return 60;
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
exports.pluginValidate = pluginValidate;
exports.pluginTimeoutInterval = pluginTimeoutInterval;
