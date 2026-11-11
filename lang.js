const supportLanguages = [
    ["auto", "自动检测"],
    ["zh-Hans", "简体中文"],
    ["zh-Hant", "繁体中文"],
    ["en", "英语"],
    ["ja", "日语"],
    ["ko", "韩语"],
    ["fr", "法语"],
    ["de", "德语"],
    ["es", "西班牙语"],
    ["it", "意大利语"],
    ["ru", "俄语"],
    ["pt", "葡萄牙语"],
    ["nl", "荷兰语"],
    ["pl", "波兰语"],
    ["ar", "阿拉伯语"],
    ["af", "南非语"],
    ["hi", "印地语"],
    ["th", "泰语"],
    ["vi", "越南语"],
    ["uz", "乌兹别克语"],
    ["tg", "塔吉克语"],
    ["fa", "波斯语"],
    ["kk", "哈萨克语"],
    ["ur", "乌尔都语"],
    ["id", "印尼语"],
    ["ms", "马来语"],
    ["pa", "旁遮普语"],
    ["ps", "普什图语"]
];

exports.supportLanguages = supportLanguages;
exports.langMap = new Map(supportLanguages.map(([key, value]) => [key, value]));
exports.langMapReverse = new Map(
    supportLanguages.map(([standardLang, lang]) => [lang, standardLang])
);

exports.isSupported = function(from, to) {
    if (from === "auto" || to === "auto") {
        return true;
    }
    return exports.langMap.has(from) && exports.langMap.has(to);
};
