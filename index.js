const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const chalk = require('chalk');
const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const bodyParser = require('body-parser');
const Convert = require('ansi-to-html');
const convert = new Convert({
  newline: true,
  fg: '#fff',
  bg: '#000',
  colors : {
    0: '#aaa'
  }
});
const config = require('./config');

const app = express();
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const serverPort = 3001;

const waitingMessage = chalk.green.bold(`\nOne Mission Tests Runner\n`) +
  `\nWebsockets Server listening on port: ${chalk.cyan(serverPort)} \n\n`;

let ws;

app.use(function(req, res, next) {
  console.log('trying to reach: ' + req.url);
  next();
});

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/screenshots')));


app.get('/', (req, res) => {
  res.send('Im alive, are you?');
});

app.post('/listImages', (req, res) => {
  const path1 = 'screenshots/fundraiserCreateAccount';
  const path2 = 'screenshots/fundraiserAdminWalkthrough';
  let retObj = { path1 : [], path2 : [] };
  fs.readdir(path1, (err, items) => {
    // console.log('Path 1 Images:', items);
    items.forEach(item => {
      retObj.path1.push(path1.replace('screenshots/', '') + '/' + item);
    });
    fs.readdir(path2, (err, items) => {
      // console.log('Path 2 Images:', items);
      items.forEach(item => {
        retObj.path2.push(path2.replace('screenshots/', '') + '/' + item);
      });
      // console.log('Returning \n', retObj);
      res.json(retObj);
    });
  });
});

app.post('/tests/fundRegister', (req, res) => {
  const targetSite = req.body.targetSite;
  const nodeArgs = ['tests/fundraiserCreateAccount.js'];
  if (req.body.targetSite) {
    nodeArgs.push('--site');
    nodeArgs.push(req.body.targetSite);
    nodeArgs.push('--target');
    nodeArgs.push(config.target);
  }
  const testProcess = spawn('node', nodeArgs);
  let errorFlag = false;

  testProcess.stdout.on('data', (chunk) => {
    // console.log(chunk);
    const textChunk = chunk.toString('utf8');
    process.stdout.write(textChunk);
    const htmlText = convert.toHtml(textChunk);
    if (textChunk.indexOf('→ Screenshot:') !== -1) {
      let parsedPath = textChunk.slice(textChunk.indexOf('onemission-tests/screenshots/') + 28);
      parsedPath = parsedPath.split('\n')[0];
      ws.send('screenshot: ' + parsedPath);
		}
    ws.send(htmlText);
  });

  testProcess.stderr.on('data', (err) => {
    console.log('stderr:', err.toString('utf8'));
    errorFlag = true;
    ws.send('error: ' + convert.toHtml(err.toString('utf8')));
  });

  testProcess.on('exit', (code) => {
    code === 0 && !errorFlag && ws.send('done');
    console.log('Test process exited with code ' + code);
  });

  res.json('success');
});

app.post('/tests/fundAdmin', (req, res) => {
  const targetSite = req.body.targetSite;
  const nodeArgs = ['tests/fundraiserAdmin.js'];
  if (req.body.targetSite) {
    nodeArgs.push('--site');
    nodeArgs.push(req.body.targetSite);
    nodeArgs.push('--target');
    nodeArgs.push(config.target);
  }
  const testProcess = spawn('node', nodeArgs);
  let errorFlag = false;


  testProcess.stdout.on('data', (chunk) => {
    // console.log(chunk);
    const textChunk = chunk.toString('utf8');
    process.stdout.write(textChunk);
    // if (textChunk.indexOf('*** ERROR ***') !== -1) {
    //   ws.send('error: ' + textChunk);
    // }
    const htmlText = convert.toHtml(textChunk);
    if (textChunk.indexOf('→ Screenshot:') !== -1) {
      let parsedPath = textChunk.slice(textChunk.indexOf('onemission-tests/screenshots/') + 28);
      parsedPath = parsedPath.split('\n')[0];
      ws.send('screenshot: ' + parsedPath);
		}
    ws && ws.send(htmlText);
  });

  testProcess.stderr.on('data', (err) => {
    const msg = err.toString('utf8');
    console.log('stderr: ',  err.toString('utf8'));
    if (msg.indexOf('WARNING:') === -1) {
      errorFlag = true;
      ws.send('error: ' + convert.toHtml(err.toString('utf8')));
    }
  });

  testProcess.on('exit', (code) => {
    code === 0 && !errorFlag && ws.send('done');
    console.log('Test process exited with code ' + code);
  });

  res.json('success');
});


app.use(function(req, res, next) {
  res.status(404);

  console.log('404', req.url);
  // respond with html page
  if (req.accepts('html')) {
    res.json('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.json({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

// error handling
app.use(function (err, req, res, next) {
  console.log(chalk.red('\n\n*** ERROR ***'));
  console.error(err);
  console.log(chalk.red('*** ERROR ***\n\n'));

  res.status(err.status ? err.status : 500).send(err.message);
});


wss.on('connection', (_ws, req) => {
  ws = _ws;
	const location = url.parse(req.url, true);
  const ipAddress = ws._socket.remoteAddress;
  const socketAddress = ws._socket.address();
	ws.send(convert.toHtml(waitingMessage));

  console.log('Connected to WebSocket version: ' + ws.protocolVersion + ', ip: ' + ipAddress);
  ws.send('Connected to WebSocket address: ' + convert.toHtml(chalk.cyan(ipAddress)));

  ws.on('message', (message) => {
		console.log('received: \n\t', message);
	});

});

server.listen(serverPort, () => {
  console.log(waitingMessage);
});
