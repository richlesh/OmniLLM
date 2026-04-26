const fs = require("fs");
const path = require("path");
const os = require("os");

const SETTINGS_PATH = path.join(os.homedir(), ".llm-chatbot-settings.json");
const { vendors: VENDORS } = require("./config.json");

const DEFAULTS = { vendor: "openai", model: "gpt-4o-mini", apiKeys: {} };

function load() {
  try {
    const saved = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    if (saved.apiKey && !saved.apiKeys) {
      saved.apiKeys = { [saved.vendor]: saved.apiKey };
      delete saved.apiKey;
    }
    return { ...DEFAULTS, ...saved, apiKeys: { ...DEFAULTS.apiKeys, ...saved.apiKeys } };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(settings) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");
}

module.exports = { load, save, VENDORS };
