import React, { useState, useEffect } from 'react';
import { AppRootProps } from '@grafana/data';

const SETTINGS_KEY = 'mcp_assistant_settings';

const DEFAULT_SETTINGS = {
  mcpServerUrl: 'http://localhost:3001'
};

export const App: React.FC<AppRootProps> = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings(JSON.parse(s));
    } catch (e) {}
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const r = await fetch(settings.mcpServerUrl + '/health');
      const d = await r.json();
      setServerInfo(d);
      setStatus(d.status === 'healthy' || d.status === 'degraded' ? 'connected' : 'disconnected');
    } catch (e) {
      setStatus('disconnected');
      setServerInfo(null);
    }
  };

  useEffect(() => { checkConnection(); }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      if ((window as any).MCPAssistant) {
        (window as any).MCPAssistant.setServerUrl(settings.mcpServerUrl);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      checkConnection();
    } catch (e) {}
  };

  const containerStyle: React.CSSProperties = { padding: '24px', maxWidth: '800px' };
  
  const cardStyle: React.CSSProperties = {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #334155'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '24px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#3b82f6',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    color: '#d8d9da',
    marginBottom: '8px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: '#111217',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    marginRight: '12px'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#334155'
  };

  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    background: status === 'connected' ? 'rgba(34, 197, 94, 0.1)' :
                status === 'disconnected' ? 'rgba(239, 68, 68, 0.1)' :
                'rgba(59, 130, 246, 0.1)',
    border: '1px solid ' + (status === 'connected' ? '#22c55e' :
                            status === 'disconnected' ? '#ef4444' : '#3b82f6')
  };

  const statusDotStyle: React.CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: status === 'connected' ? '#22c55e' :
                status === 'disconnected' ? '#ef4444' : '#3b82f6'
  };

  const infoBoxStyle: React.CSSProperties = {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px'
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        <span style={{ fontSize: '32px' }}>🤖</span>
        MCP Assistant
      </div>
      <div style={subtitleStyle}>
        Universal AI chatbot sidebar for Grafana with real-time SSE streaming
      </div>

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>🔌 MCP Server Connection</div>
        
        <div style={statusStyle}>
          <div style={statusDotStyle}></div>
          <span style={{ color: '#fff', fontSize: '14px' }}>
            {status === 'connected' ? 'Connected to MCP Server' :
             status === 'disconnected' ? 'Disconnected - Check server URL' :
             'Checking connection...'}
          </span>
        </div>

        {serverInfo && status === 'connected' && (
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
            <div>✅ Status: {serverInfo.status}</div>
            {serverInfo.llm_available !== undefined && <div>✅ LLM Available: {serverInfo.llm_available ? 'Yes' : 'No'}</div>}
            {serverInfo.sse_enabled !== undefined && <div>✅ SSE Streaming: {serverInfo.sse_enabled ? 'Enabled' : 'Disabled'}</div>}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>MCP Server URL</label>
          <input
            type="text"
            style={inputStyle}
            value={settings.mcpServerUrl}
            onChange={(e) => setSettings({ ...settings, mcpServerUrl: e.target.value })}
            placeholder="http://localhost:3001"
          />
        </div>

        <div>
          <button style={buttonStyle} onClick={saveSettings}>
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
          <button style={secondaryButtonStyle} onClick={checkConnection}>
            Test Connection
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>💡 How to Use</div>
        
        <div style={{ color: '#d8d9da', fontSize: '14px', lineHeight: 1.8 }}>
          <p><strong>1.</strong> Click the blue <strong>🤖 button</strong> in the bottom-right corner of any Grafana page</p>
          <p><strong>2.</strong> Type your question in natural language</p>
          <p><strong>3.</strong> Watch responses stream in real-time with SSE</p>
        </div>

        <div style={infoBoxStyle}>
          <div style={{ color: '#3b82f6', fontWeight: 600, marginBottom: '8px' }}>Example Questions:</div>
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>
            • "What is my total cost?"<br/>
            • "Show me error rates"<br/>
            • "Which model has the highest latency?"<br/>
            • "Give me a summary of current metrics"
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>⌨️ Keyboard Shortcuts</div>
        <div style={{ color: '#d8d9da', fontSize: '13px' }}>
          <p><strong>Ctrl + B</strong> - Toggle sidebar</p>
          <p><strong>Enter</strong> - Send message</p>
          <p><strong>Shift + Enter</strong> - New line</p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>ℹ️ About</div>
        <div style={{ color: '#94a3b8', fontSize: '13px' }}>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Author:</strong> Kamal Singh Bisht</p>
          <p><strong>License:</strong> Apache-2.0</p>
          <p style={{ marginTop: '12px' }}>
            MCP Assistant connects to any MCP (Model Context Protocol) server,
            enabling AI-powered conversations directly within Grafana. Perfect for
            observability, monitoring, and data analysis workflows.
          </p>
        </div>
      </div>
    </div>
  );
};
