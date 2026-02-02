/**
 * MCP Assistant Floating Sidebar
 * Version: 1.0.0
 * Author: Kamal Singh Bisht
 * 
 * Features:
 * - 🔵 Blue Theme
 * - 🚀 SSE Streaming
 * - 📊 Inline Charts
 * - 💬 Floating Sidebar
 * - 🗑️ Clear Chat
 */

const CONFIG = {
  version: '1.0.0',
  storageKey: 'mcp_assistant_settings',
  defaultServerUrl: 'http://localhost:3001'
};

const COLORS = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',
  primaryGlow: 'rgba(59, 130, 246, 0.4)',
  primaryGlowStrong: 'rgba(59, 130, 246, 0.5)',
  background: '#111217',
  backgroundAlt: '#181b1f',
  surface: '#1f2229',
  text: '#d8d9da',
  textMuted: '#8e8e8e',
  border: '#2c3235',
  success: '#73bf69',
  error: '#f2495c'
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chart?: string;
  timestamp: Date;
}

interface State {
  isOpen: boolean;
  showSettings: boolean;
  isLoading: boolean;
  isConnected: boolean;
  serverUrl: string;
  messages: Message[];
  eventSource: EventSource | null;
}

let state: State = {
  isOpen: false,
  showSettings: false,
  isLoading: false,
  isConnected: false,
  serverUrl: CONFIG.defaultServerUrl,
  messages: [],
  eventSource: null
};

let sidebar: HTMLElement;
let toggleBtn: HTMLElement;
let messagesEl: HTMLElement;
let inputEl: HTMLTextAreaElement;
let sendBtn: HTMLButtonElement;
let statusEl: HTMLElement;

function buildStyles(): string {
  return [
    '.mcp-toggle-btn {',
    '  position: fixed;',
    '  bottom: 20px;',
    '  right: 20px;',
    '  width: 44px;',
    '  height: 44px;',
    '  border-radius: 50%;',
    '  background: linear-gradient(135deg, ' + COLORS.primary + ', ' + COLORS.primaryDark + ');',
    '  border: none;',
    '  cursor: pointer;',
    '  box-shadow: 0 3px 12px ' + COLORS.primaryGlow + ';',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 20px;',
    '  z-index: 10000;',
    '  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);',
    '}',
    '.mcp-toggle-btn:hover {',
    '  transform: scale(1.1);',
    '  box-shadow: 0 4px 16px ' + COLORS.primaryGlowStrong + ';',
    '}',
    '.mcp-toggle-btn.open {',
    '  right: 400px;',
    '  background: ' + COLORS.error + ';',
    '  box-shadow: 0 3px 12px rgba(239, 68, 68, 0.4);',
    '}',
    '.mcp-sidebar {',
    '  position: fixed;',
    '  top: 0;',
    '  right: -400px;',
    '  width: 380px;',
    '  height: 100vh;',
    '  background: ' + COLORS.background + ';',
    '  border-left: 1px solid ' + COLORS.border + ';',
    '  display: flex;',
    '  flex-direction: column;',
    '  z-index: 9999;',
    '  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);',
    '  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
    '  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.4);',
    '}',
    '.mcp-sidebar.open { right: 0; }',
    '.mcp-header {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: space-between;',
    '  padding: 14px 16px;',
    '  background: ' + COLORS.surface + ';',
    '  border-bottom: 1px solid ' + COLORS.border + ';',
    '  flex-shrink: 0;',
    '}',
    '.mcp-header-left { display: flex; align-items: center; gap: 12px; }',
    '.mcp-avatar {',
    '  width: 40px;',
    '  height: 40px;',
    '  background: linear-gradient(135deg, ' + COLORS.primary + ', ' + COLORS.primaryDark + ');',
    '  border-radius: 10px;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 20px;',
    '  box-shadow: 0 2px 8px ' + COLORS.primaryGlow + ';',
    '}',
    '.mcp-title-wrap { display: flex; flex-direction: column; gap: 2px; }',
    '.mcp-title { color: #fff; font-size: 15px; font-weight: 600; }',
    '.mcp-status { display: flex; align-items: center; gap: 5px; font-size: 11px; color: ' + COLORS.textMuted + '; }',
    '.mcp-status.connected { color: ' + COLORS.success + '; }',
    '.mcp-status.streaming { color: ' + COLORS.primary + '; }',
    '.mcp-status.error { color: ' + COLORS.error + '; }',
    '.mcp-status-dot { width: 7px; height: 7px; border-radius: 50%; background: ' + COLORS.textMuted + '; }',
    '.mcp-status.connected .mcp-status-dot { background: ' + COLORS.success + '; box-shadow: 0 0 6px ' + COLORS.success + '; }',
    '.mcp-status.streaming .mcp-status-dot { background: ' + COLORS.primary + '; animation: mcpPulse 1s infinite; }',
    '@keyframes mcpPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }',
    '.mcp-header-btns { display: flex; gap: 6px; }',
    '.mcp-hdr-btn {',
    '  width: 32px;',
    '  height: 32px;',
    '  border-radius: 8px;',
    '  border: none;',
    '  background: rgba(255, 255, 255, 0.06);',
    '  color: ' + COLORS.textMuted + ';',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 14px;',
    '  transition: all 0.15s;',
    '}',
    '.mcp-hdr-btn:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }',
    '.mcp-hdr-btn.active { background: ' + COLORS.primary + '; color: #fff; }',
    '.mcp-settings {',
    '  display: none;',
    '  padding: 14px;',
    '  background: ' + COLORS.backgroundAlt + ';',
    '  border-bottom: 1px solid ' + COLORS.border + ';',
    '  flex-shrink: 0;',
    '}',
    '.mcp-settings.active { display: block; animation: mcpSlideDown 0.2s ease; }',
    '@keyframes mcpSlideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }',
    '.mcp-settings-title { font-size: 12px; color: ' + COLORS.primary + '; font-weight: 600; margin-bottom: 10px; }',
    '.mcp-settings-label { display: block; font-size: 11px; color: ' + COLORS.text + '; margin-bottom: 4px; }',
    '.mcp-settings-input {',
    '  width: 100%;',
    '  padding: 8px 10px;',
    '  background: ' + COLORS.background + ';',
    '  border: 1px solid ' + COLORS.border + ';',
    '  border-radius: 6px;',
    '  color: ' + COLORS.text + ';',
    '  font-size: 12px;',
    '  outline: none;',
    '  margin-bottom: 10px;',
    '}',
    '.mcp-settings-input:focus { border-color: ' + COLORS.primary + '; }',
    '.mcp-settings-btn {',
    '  width: 100%;',
    '  padding: 8px;',
    '  background: linear-gradient(135deg, ' + COLORS.primary + ', ' + COLORS.primaryDark + ');',
    '  border: none;',
    '  border-radius: 6px;',
    '  color: #fff;',
    '  font-size: 12px;',
    '  cursor: pointer;',
    '}',
    '.mcp-messages {',
    '  flex: 1;',
    '  overflow-y: auto;',
    '  padding: 14px;',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 12px;',
    '}',
    '.mcp-messages::-webkit-scrollbar { width: 5px; }',
    '.mcp-messages::-webkit-scrollbar-thumb { background: ' + COLORS.border + '; border-radius: 3px; }',
    '.mcp-msg { display: flex; flex-direction: column; max-width: 85%; animation: mcpMsgIn 0.2s ease; }',
    '@keyframes mcpMsgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }',
    '.mcp-msg.user { align-self: flex-end; }',
    '.mcp-msg.assistant { align-self: flex-start; }',
    '.mcp-msg-content {',
    '  padding: 10px 14px;',
    '  border-radius: 14px;',
    '  font-size: 13px;',
    '  line-height: 1.5;',
    '  color: ' + COLORS.text + ';',
    '  word-wrap: break-word;',
    '  white-space: pre-wrap;',
    '}',
    '.mcp-msg.user .mcp-msg-content {',
    '  background: linear-gradient(135deg, ' + COLORS.primary + ', ' + COLORS.primaryDark + ');',
    '  color: #fff;',
    '  border-bottom-right-radius: 4px;',
    '}',
    '.mcp-msg.assistant .mcp-msg-content {',
    '  background: ' + COLORS.surface + ';',
    '  border: 1px solid ' + COLORS.border + ';',
    '  border-bottom-left-radius: 4px;',
    '}',
    '.mcp-msg-content strong { color: ' + COLORS.primaryLight + '; }',
    '.mcp-msg-content code { background: rgba(0, 0, 0, 0.3); padding: 1px 5px; border-radius: 3px; font-size: 11px; font-family: monospace; }',
    '.mcp-msg-time { font-size: 10px; color: ' + COLORS.textMuted + '; margin-top: 4px; padding: 0 4px; }',
    '.mcp-msg.user .mcp-msg-time { text-align: right; color: rgba(255,255,255,0.5); }',
    '.mcp-cursor { display: inline-block; width: 2px; height: 14px; background: ' + COLORS.primary + '; margin-left: 2px; vertical-align: text-bottom; animation: mcpBlink 1s infinite; }',
    '@keyframes mcpBlink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }',
    '.mcp-chart { margin-top: 8px; border-radius: 6px; overflow: hidden; border: 1px solid ' + COLORS.border + '; }',
    '.mcp-chart img { width: 100%; display: block; }',
    '.mcp-welcome { text-align: center; padding: 30px 16px; }',
    '.mcp-welcome-icon { font-size: 48px; margin-bottom: 12px; }',
    '.mcp-welcome-title { font-size: 18px; color: #fff; font-weight: 600; margin-bottom: 8px; }',
    '.mcp-welcome-text { font-size: 12px; color: ' + COLORS.textMuted + '; margin-bottom: 16px; line-height: 1.5; }',
    '.mcp-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }',
    '.mcp-chip {',
    '  padding: 8px 12px;',
    '  background: rgba(59, 130, 246, 0.1);',
    '  border: 1px solid rgba(59, 130, 246, 0.25);',
    '  border-radius: 16px;',
    '  color: ' + COLORS.text + ';',
    '  font-size: 11px;',
    '  cursor: pointer;',
    '  transition: all 0.15s;',
    '}',
    '.mcp-chip:hover { background: rgba(59, 130, 246, 0.2); border-color: ' + COLORS.primary + '; transform: translateY(-1px); }',
    '.mcp-input-wrap {',
    '  padding: 12px;',
    '  background: ' + COLORS.surface + ';',
    '  border-top: 1px solid ' + COLORS.border + ';',
    '  display: flex;',
    '  gap: 8px;',
    '  align-items: center;',
    '  flex-shrink: 0;',
    '}',
    '.mcp-input {',
    '  flex: 1;',
    '  padding: 10px 12px;',
    '  background: ' + COLORS.background + ';',
    '  border: 1px solid ' + COLORS.border + ';',
    '  border-radius: 8px;',
    '  color: ' + COLORS.text + ';',
    '  font-size: 13px;',
    '  resize: none;',
    '  height: 38px;',
    '  font-family: inherit;',
    '  outline: none;',
    '}',
    '.mcp-input:focus { border-color: ' + COLORS.primary + '; }',
    '.mcp-input::placeholder { color: ' + COLORS.textMuted + '; }',
    '.mcp-send {',
    '  width: 38px;',
    '  height: 38px;',
    '  background: linear-gradient(135deg, ' + COLORS.primary + ', ' + COLORS.primaryDark + ');',
    '  border: none;',
    '  border-radius: 8px;',
    '  color: #fff;',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 16px;',
    '  transition: all 0.15s;',
    '  flex-shrink: 0;',
    '  box-shadow: 0 2px 6px ' + COLORS.primaryGlow + ';',
    '}',
    '.mcp-send:hover:not(:disabled) { transform: scale(1.05); }',
    '.mcp-send:disabled { opacity: 0.5; cursor: not-allowed; }',
    '.mcp-footer {',
    '  padding: 8px 12px;',
    '  background: ' + COLORS.backgroundAlt + ';',
    '  border-top: 1px solid ' + COLORS.border + ';',
    '  font-size: 10px;',
    '  color: ' + COLORS.textMuted + ';',
    '  text-align: center;',
    '  flex-shrink: 0;',
    '}',
    '@media (max-width: 768px) {',
    '  .mcp-sidebar { width: 100%; right: -100%; }',
    '  .mcp-toggle-btn.open { right: 20px; }',
    '}'
  ].join('\n');
}

function buildSidebarHTML(): string {
  return [
    '<div class="mcp-sidebar" id="mcp-sidebar">',
    '  <div class="mcp-header">',
    '    <div class="mcp-header-left">',
    '      <div class="mcp-avatar">🤖</div>',
    '      <div class="mcp-title-wrap">',
    '        <div class="mcp-title">MCP Assistant</div>',
    '        <div class="mcp-status" id="mcp-status">',
    '          <span class="mcp-status-dot"></span>',
    '          <span>Connecting...</span>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="mcp-header-btns">',
    '      <button class="mcp-hdr-btn" id="mcp-btn-clear" title="Clear Chat">🗑️</button>',
    '      <button class="mcp-hdr-btn" id="mcp-btn-settings" title="Settings">⚙️</button>',
    '      <button class="mcp-hdr-btn" id="mcp-btn-close" title="Close">✕</button>',
    '    </div>',
    '  </div>',
    '  <div class="mcp-settings" id="mcp-settings">',
    '    <div class="mcp-settings-title">🔌 MCP Server</div>',
    '    <label class="mcp-settings-label">Server URL</label>',
    '    <input type="text" class="mcp-settings-input" id="mcp-server-url" value="' + state.serverUrl + '">',
    '    <button class="mcp-settings-btn" id="mcp-test-btn">Test Connection</button>',
    '  </div>',
    '  <div class="mcp-messages" id="mcp-messages">',
    '    <div class="mcp-welcome" id="mcp-welcome">',
    '      <div class="mcp-welcome-icon">🤖</div>',
    '      <div class="mcp-welcome-title">MCP Assistant</div>',
    '      <div class="mcp-welcome-text">Ask questions and get AI-powered answers.<br>Responses stream in real-time!</div>',
    '      <div class="mcp-chips">',
    '        <span class="mcp-chip" data-q="What is my total cost?">💰 Total cost</span>',
    '        <span class="mcp-chip" data-q="Show error rates">📊 Error rates</span>',
    '        <span class="mcp-chip" data-q="Show metrics summary">📈 Summary</span>',
    '        <span class="mcp-chip" data-q="Help me analyze data">🔍 Analyze</span>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="mcp-input-wrap">',
    '    <textarea class="mcp-input" id="mcp-input" placeholder="Ask anything..." rows="1"></textarea>',
    '    <button class="mcp-send" id="mcp-send">➤</button>',
    '  </div>',
    '  <div class="mcp-footer">MCP Assistant v' + CONFIG.version + ' • SSE Streaming</div>',
    '</div>',
    '<button class="mcp-toggle-btn" id="mcp-toggle">🤖</button>'
  ].join('\n');
}

export function initSidebar(): void {
  if (document.getElementById('mcp-sidebar')) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setup());
  } else {
    setTimeout(() => setup(), 500);
  }
}

function setup(): void {
  loadSettings();
  injectStyles();
  injectHTML();
  bindEvents();
  checkConnection();
  console.log('[MCP Assistant] Initialized v' + CONFIG.version);
}

function loadSettings(): void {
  try {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      state.serverUrl = parsed.mcpServerUrl || CONFIG.defaultServerUrl;
    }
  } catch (e) {}
}

function saveSettings(): void {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({ mcpServerUrl: state.serverUrl }));
  } catch (e) {}
}

function injectStyles(): void {
  const style = document.createElement('style');
  style.id = 'mcp-assistant-styles';
  style.textContent = buildStyles();
  document.head.appendChild(style);
}

function injectHTML(): void {
  document.body.insertAdjacentHTML('beforeend', buildSidebarHTML());
  sidebar = document.getElementById('mcp-sidebar')!;
  toggleBtn = document.getElementById('mcp-toggle')!;
  messagesEl = document.getElementById('mcp-messages')!;
  inputEl = document.getElementById('mcp-input') as HTMLTextAreaElement;
  sendBtn = document.getElementById('mcp-send') as HTMLButtonElement;
  statusEl = document.getElementById('mcp-status')!;
}

function bindEvents(): void {
  toggleBtn.addEventListener('click', toggle);
  document.getElementById('mcp-btn-close')?.addEventListener('click', toggle);
  document.getElementById('mcp-btn-settings')?.addEventListener('click', toggleSettings);
  document.getElementById('mcp-btn-clear')?.addEventListener('click', clearChat);

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
  });

  document.querySelectorAll('.mcp-chip').forEach(chip => {
    chip.addEventListener('click', function(this: HTMLElement) {
      const query = this.getAttribute('data-q');
      if (query) {
        inputEl.value = query;
        sendMessage();
      }
    });
  });

  document.getElementById('mcp-server-url')?.addEventListener('change', function(this: HTMLInputElement) {
    state.serverUrl = this.value;
    saveSettings();
  });

  document.getElementById('mcp-test-btn')?.addEventListener('click', () => {
    const urlInput = document.getElementById('mcp-server-url') as HTMLInputElement;
    state.serverUrl = urlInput.value;
    saveSettings();
    checkConnection();
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      toggle();
    }
  });
}

function toggle(): void {
  state.isOpen = !state.isOpen;
  sidebar.classList.toggle('open', state.isOpen);
  toggleBtn.classList.toggle('open', state.isOpen);
  toggleBtn.innerHTML = state.isOpen ? '✕' : '🤖';
  if (state.isOpen) inputEl.focus();
}

function toggleSettings(): void {
  state.showSettings = !state.showSettings;
  const settingsEl = document.getElementById('mcp-settings');
  const btnSettings = document.getElementById('mcp-btn-settings');
  settingsEl?.classList.toggle('active', state.showSettings);
  btnSettings?.classList.toggle('active', state.showSettings);
}

function clearChat(): void {
  state.messages = [];
  const msgs = messagesEl.querySelectorAll('.mcp-msg');
  msgs.forEach(m => m.remove());
  const welcomeEl = document.getElementById('mcp-welcome');
  if (welcomeEl) welcomeEl.style.display = 'block';
}

async function checkConnection(): Promise<void> {
  updateStatus('Checking...', '');
  try {
    const response = await fetch(state.serverUrl + '/health');
    const data = await response.json();
    state.isConnected = data.status === 'healthy' || data.status === 'degraded';
    updateStatus(state.isConnected ? 'MCP Connected' : 'Degraded', state.isConnected ? 'connected' : 'error');
  } catch (e) {
    state.isConnected = false;
    updateStatus('Disconnected', 'error');
  }
}

function updateStatus(text: string, statusClass: string): void {
  statusEl.className = 'mcp-status ' + statusClass;
  statusEl.innerHTML = '<span class="mcp-status-dot"></span><span>' + text + '</span>';
}

function addMessage(role: 'user' | 'assistant', content: string, chart?: string): string {
  const msg: Message = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    role,
    content,
    chart,
    timestamp: new Date()
  };
  state.messages.push(msg);
  renderMessage(msg);
  scrollToBottom();
  return msg.id;
}

function renderMessage(msg: Message): void {
  const welcomeEl = document.getElementById('mcp-welcome');
  if (welcomeEl) welcomeEl.style.display = 'none';

  const div = document.createElement('div');
  div.className = 'mcp-msg ' + msg.role;
  div.id = msg.id;

  const chartHtml = msg.chart
    ? '<div class="mcp-chart"><img src="data:image/png;base64,' + msg.chart + '" alt="Chart"></div>'
    : '';

  div.innerHTML =
    '<div class="mcp-msg-content">' + formatContent(msg.content) + '</div>' +
    chartHtml +
    '<div class="mcp-msg-time">' + formatTime(msg.timestamp) + '</div>';

  messagesEl.appendChild(div);
}

function updateMessage(msgId: string, content: string, streaming: boolean, chart?: string): void {
  const div = document.getElementById(msgId);
  if (!div) return;

  const contentEl = div.querySelector('.mcp-msg-content');
  if (contentEl) {
    contentEl.innerHTML = formatContent(content) + (streaming ? '<span class="mcp-cursor"></span>' : '');
  }

  if (chart) {
    let chartEl = div.querySelector('.mcp-chart');
    if (!chartEl) {
      chartEl = document.createElement('div');
      chartEl.className = 'mcp-chart';
      const contentDiv = div.querySelector('.mcp-msg-content');
      contentDiv?.after(chartEl);
    }
    chartEl.innerHTML = '<img src="data:image/png;base64,' + chart + '" alt="Chart">';
  }

  scrollToBottom();
}

function formatContent(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function scrollToBottom(): void {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage(): Promise<void> {
  const question = inputEl.value.trim();
  if (!question || state.isLoading) return;

  inputEl.value = '';
  inputEl.style.height = 'auto';
  state.isLoading = true;
  sendBtn.disabled = true;

  addMessage('user', question);
  const assistantId = addMessage('assistant', '');

  if (state.isConnected) {
    await streamSSE(question, assistantId);
  } else {
    updateMessage(assistantId, '⚠️ Not connected to MCP server. Please check settings.', false);
    state.isLoading = false;
    sendBtn.disabled = false;
  }
}

async function streamSSE(question: string, msgId: string): Promise<void> {
  const url = state.serverUrl + '/stream?question=' + encodeURIComponent(question);
  let fullContent = '';
  let chart: string | undefined;

  updateStatus('Streaming...', 'streaming');

  try {
    state.eventSource = new EventSource(url);

    state.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.token) {
          fullContent += data.token;
          updateMessage(msgId, fullContent, true);
        }

        if (data.chart) {
          chart = data.chart;
        }

        if (data.done) {
          state.eventSource?.close();
          state.eventSource = null;
          state.isLoading = false;
          sendBtn.disabled = false;
          updateMessage(msgId, fullContent || data.full_response || 'No response', false, chart);
          updateStatus('MCP Connected', 'connected');
        }

        if (data.error) {
          state.eventSource?.close();
          state.eventSource = null;
          state.isLoading = false;
          sendBtn.disabled = false;
          updateMessage(msgId, '❌ ' + data.error, false);
          updateStatus('Error', 'error');
        }
      } catch (e) {}
    };

    state.eventSource.onerror = () => {
      state.eventSource?.close();
      state.eventSource = null;

      if (!fullContent) {
        fetchHTTP(question, msgId);
      } else {
        state.isLoading = false;
        sendBtn.disabled = false;
        updateMessage(msgId, fullContent, false, chart);
      }

      updateStatus('Reconnecting...', '');
      setTimeout(checkConnection, 3000);
    };
  } catch (e) {
    fetchHTTP(question, msgId);
  }
}

async function fetchHTTP(question: string, msgId: string): Promise<void> {
  updateStatus('Loading...', '');

  try {
    const response = await fetch(state.serverUrl + '/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    updateMessage(msgId, data.answer || data.response || 'No response', false, data.chart);
    updateStatus('MCP Connected', 'connected');
  } catch (e) {
    updateMessage(msgId, '❌ Failed to connect to server', false);
    updateStatus('Disconnected', 'error');
  }

  state.isLoading = false;
  sendBtn.disabled = false;
}

(window as any).MCPAssistant = {
  toggle,
  setServerUrl: (url: string) => {
    state.serverUrl = url;
    saveSettings();
    checkConnection();
  },
  getServerUrl: () => state.serverUrl
};
