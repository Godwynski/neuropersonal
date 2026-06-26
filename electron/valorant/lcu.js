const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { app } = require('electron');

class LCUClient {
  constructor(onMessage) {
    this.ws = null;
    this.onMessage = onMessage;
  }

  getLockfile() {
    const localAppData = process.env.LOCALAPPDATA || path.join(app.getPath('home'), 'AppData', 'Local');
    const lockfilePath = path.join(localAppData, 'Riot Games', 'Riot Client', 'Config', 'lockfile');
    if (fs.existsSync(lockfilePath)) {
      const contents = fs.readFileSync(lockfilePath, 'utf8');
      const [name, pid, port, password, protocol] = contents.split(':');
      return { port, password, protocol };
    }
    return null;
  }

  connect() {
    const creds = this.getLockfile();
    if (!creds) {
      console.log('LCU lockfile not found. Is Riot Client running?');
      return false;
    }

    const wsUrl = `wss://riot:${creds.password}@127.0.0.1:${creds.port}`;
    this.ws = new WebSocket(wsUrl, {
      rejectUnauthorized: false
    });

    this.ws.on('open', () => {
      console.log('Connected to LCU WebSocket');
      this.ws.send(JSON.stringify([5, 'OnJsonApiEvent']));
    });

    this.ws.on('message', (data) => {
      try {
        const payload = JSON.parse(data);
        if (this.onMessage && payload.length > 2) {
          this.onMessage(payload[2]);
        }
      } catch (err) {}
    });

    this.ws.on('error', (err) => console.error('LCU WS Error:', err.message));
    this.ws.on('close', () => console.log('LCU WS Closed'));
    
    return true;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

module.exports = LCUClient;
