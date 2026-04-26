const { app, BrowserWindow, ipcMain, Menu, nativeImage, dialog } = require("electron");
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const path = require("path");
const fs = require("fs");
const https = require("https");
const { load, save, VENDORS } = require("./settings");

const appIcon = nativeImage.createFromPath(path.join(__dirname, "app_icon.icns"));

app.name = "LLM Chatbot";

app.setAboutPanelOptions({
  applicationName: "LLM Chatbot",
  applicationVersion: "1.0",
  credits: `by Richard Lesh\nBuilt with Electron v${process.versions.electron}`,
  iconImage: appIcon
});

let mainWin, settingsWin;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    icon: appIcon,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  win.loadFile("index.html");
  if (!mainWin) {
    mainWin = win;
    buildMenu();
  }
  return win;
}

function buildMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { label: "Settings…", click: openSettings },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "File",
      submenu: [
        {
          label: "New Chat",
          accelerator: "CmdOrCtrl+N",
          click: () => createWindow()
        },
        { type: "separator" },
        {
          label: "Save Chat As…",
          accelerator: "CmdOrCtrl+S",
          click: () => BrowserWindow.getFocusedWindow()?.webContents.send("save-chat")
        },
        {
          label: "Load Chat…",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const { filePaths } = await dialog.showOpenDialog(mainWin, {
              title: "Load Chat",
              filters: [{ name: "Chat Files", extensions: ["json"] }],
              properties: ["openFile"]
            });
            if (!filePaths?.length) return;
            const data = JSON.parse(fs.readFileSync(filePaths[0], "utf8"));
            const win = createWindow();
            win.webContents.once("did-finish-load", () => {
              win.webContents.send("load-chat-data", data);
            });
          }
        },
        { type: "separator" },
        {
          label: "Close",
          accelerator: "CmdOrCtrl+W",
          click: () => BrowserWindow.getFocusedWindow()?.close()
        }
      ]
    },
    { role: "editMenu" },
    { role: "windowMenu" }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function openSettings() {
  if (settingsWin) return settingsWin.focus();
  settingsWin = new BrowserWindow({
    width: 420,
    height: 350,
    resizable: false,
    parent: mainWin,
    modal: true,
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  settingsWin.setMenuBarVisibility(false);
  settingsWin.loadFile("settings.html");
  settingsWin.on("closed", () => { settingsWin = null; });
}

ipcMain.handle("save-chat-dialog", async (_event, data) => {
  const win = BrowserWindow.getFocusedWindow() || mainWin;
  const { filePath } = await dialog.showSaveDialog(win, {
    title: "Save Chat",
    defaultPath: path.join(require("os").homedir(), "Documents", "chat.json"),
    filters: [{ name: "Chat Files", extensions: ["json"] }]
  });
  if (!filePath) return false;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  return true;
});

ipcMain.handle("fetch-models", async (_event, { vendor, apiKey }) => {
  try {
    const baseURLs = {
      alibaba:  "https://dashscope.aliyuncs.com/compatible-mode/v1",
      deepseek: "https://api.deepseek.com",
      meta:     "https://api.llama.com/compat/v1",
      google:   "https://generativelanguage.googleapis.com/v1beta/openai"
    };
    if (vendor === "anthropic") {
      const client = new Anthropic({ apiKey });
      const res = await client.models.list();
      return res.data.map(m => m.id).sort();
    }
    const client = new OpenAI({ apiKey, baseURL: baseURLs[vendor] });
    const res = await client.models.list();
    return res.data.map(m => m.id).sort();
  } catch {
    return null; // fall back to config.json defaults
  }
});

ipcMain.handle("settings-get-data", () => ({ settings: load(), VENDORS }));

ipcMain.handle("settings-save", (_e, newSettings) => {
  save(newSettings);
  settingsWin?.close();
});

ipcMain.handle("settings-cancel", () => settingsWin?.close());

ipcMain.handle("chat", async (_event, messages) => {
  const { vendor, model, apiKeys } = load();
  const apiKey = apiKeys?.[vendor] || "";

  if (vendor === "anthropic") {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model,
      max_tokens: 4096,
      messages
    });
    return res.content[0].text;
  }

  const baseURLs = {
    alibaba:  "https://dashscope.aliyuncs.com/compatible-mode/v1",
    deepseek: "https://api.deepseek.com",
    meta:     "https://api.llama.com/compat/v1",
    google:   "https://generativelanguage.googleapis.com/v1beta/openai"
  };
  const baseURL = baseURLs[vendor];

  const client = new OpenAI({ apiKey, baseURL });
  const res = await client.chat.completions.create({ model, messages });
  return res.choices[0].message.content;
});

ipcMain.handle("chat-with-image", async (_event, { image, text }) => {
  const { vendor, model, apiKeys } = load();
  const apiKey = apiKeys?.[vendor] || "";

  if (vendor === "anthropic") {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model,
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.base64 } },
          { type: "text", text: text || "What is in this image?" }
        ]
      }]
    });
    return res.content[0].text;
  }

  const baseURLs = { alibaba: "https://dashscope.aliyuncs.com/compatible-mode/v1", deepseek: "https://api.deepseek.com", meta: "https://api.llama.com/compat/v1", google: "https://generativelanguage.googleapis.com/v1beta/openai" };
  const client = new OpenAI({ apiKey, baseURL: baseURLs[vendor] });
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: [
      { type: "text", text: text || "What is in this image?" },
      { type: "image_url", image_url: { url: `data:${image.mediaType};base64,${image.base64}` } }
    ]}]
  });
  return res.choices[0].message.content;
});

ipcMain.handle("generate-image", async (_event, promptText) => {
  const { apiKeys } = load();
  const apiKey = apiKeys?.openai || "";
  const client = new OpenAI({ apiKey });
  const res = await client.images.generate({ model: "dall-e-3", prompt: promptText, n: 1, size: "1024x1024" });
  return res.data[0].url;
});

ipcMain.handle("download-image", async (_event, { url, promptText }) => {
  const { filePath } = await dialog.showSaveDialog(mainWin, {
    title: "Save Image",
    defaultPath: path.join(require("os").homedir(), "Downloads", `${promptText.slice(0, 40).replace(/[^a-z0-9]/gi, "_")}.png`),
    filters: [{ name: "Images", extensions: ["png"] }]
  });
  if (!filePath) return;
  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, res => res.pipe(file).on("finish", resolve).on("error", reject));
  });
});

ipcMain.handle("image-context-menu", async (_event, src) => {
  const { Menu: CtxMenu, clipboard, nativeImage: ni } = require("electron");
  const menu = CtxMenu.buildFromTemplate([
    {
      label: "Copy Image",
      click: async () => {
        if (src.startsWith("http")) {
          // fetch URL into buffer then copy
          const { net } = require("electron");
          const res = await net.fetch(src);
          const buf = Buffer.from(await res.arrayBuffer());
          clipboard.writeImage(ni.createFromBuffer(buf));
        } else {
          // data URL
          const base64 = src.split(",")[1];
          clipboard.writeImage(ni.createFromBuffer(Buffer.from(base64, "base64")));
        }
      }
    },
    {
      label: "Save Image As…",
      click: async () => {
        const { filePath } = await dialog.showSaveDialog(mainWin, {
          title: "Save Image",
          defaultPath: path.join(require("os").homedir(), "Downloads", "image.png"),
          filters: [{ name: "Images", extensions: ["png", "jpg"] }]
        });
        if (!filePath) return;
        if (src.startsWith("http")) {
          await new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filePath);
            https.get(src, res => res.pipe(file).on("finish", resolve).on("error", reject));
          });
        } else {
          const base64 = src.split(",")[1];
          fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
        }
      }
    }
  ]);
  menu.popup({ window: mainWin });
});

app.whenReady().then(createWindow);
