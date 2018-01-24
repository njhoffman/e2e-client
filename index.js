const path = require('path');
const chalk = require('chalk');
const express = require('express');
const http = require('http');
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

const serverPort = 3001;
const config = require('./config');
config.connectedMessage =
  chalk.green.bold(`\n${config.siteName} Client Browser e2e Test Runner\n`) +
  `\nServer listening on port: ${chalk.cyan(serverPort)} \n\n`;

const app = express();
app.config = config;
app.convert = convert;
app.server = http.createServer(app);

require('./websockets')(app);

const onemissionRouter = require('./routes/onemission')(app);

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log('trying to reach: ' + req.url);
  next();
});

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/screenshots')));


app.get('/', (req, res) => {
  res.send('Im alive, are you?');
});

app.use('/config', (req, res) => {
  res.json(config);
});

app.use('/onemission', onemissionRouter);


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



app.server.listen(serverPort, () => {
  console.log(config.connectedMessage);
});
