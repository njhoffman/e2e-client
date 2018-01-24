const WebSocket = require('ws');
const chalk = require('chalk');
const url = require('url');

module.exports = (app) => {
  const wss = new WebSocket.Server({ server: app.server });
  wss.on('connection', (ws, req) => {
    app.ws = ws;
    const location = url.parse(req.url, true);
    const ipAddress = ws._socket.remoteAddress;
    const socketAddress = ws._socket.address();
    ws.send(app.convert.toHtml(app.config.connectedMessage));

    console.log('Connected to WebSocket version: ' + ws.protocolVersion + ', ip: ' + ipAddress);
    ws.send('Connected to WebSocket address: ' + app.convert.toHtml(chalk.cyan(ipAddress)));

    ws.on('message', (message) => {
      console.log('received: \n\t', message);
    });
  });
};

