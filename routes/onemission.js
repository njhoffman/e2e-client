const spawn = require('child_process').spawn;
const fs = require('fs');
const express = require('express');
const router = express.Router();

const ssDir = 'e2e-client/screenshots/onemission/';
const ssDirRelative = '../screenshots/onemission';
const testDir = `sites/onemission`;

module.exports = (app) => {
  const { config, convert } = app;

  router.post('/listImages', (req, res) => {
    const path1 = `${ssDirRelative}/fundraiserCreateAccount`;
    const path2 = `${ssDirRelative}/fundraiserAdminWalkthrough`;
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

  router.post('/fundRegister', (req, res) => {
    const targetSite = req.body.targetSite;
    const nodeArgs = [`${testDir}/fundraiserCreateAccount.js`];
    if (req.body.targetSite) {
      nodeArgs.push('--site');
      nodeArgs.push('onemission');
      nodeArgs.push('--siteUrl');
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
        let parsedPath = textChunk.slice(textChunk.indexOf(ssDir) + ssDir.length);
        parsedPath = parsedPath.split('\n')[0];
        app.ws.send('screenshot: ' + parsedPath);
      }
      app.ws.send(htmlText);
    });

    testProcess.stderr.on('data', (err) => {
      console.log('stderr:', err.toString('utf8'));
      errorFlag = true;
      app.ws.send('error: ' + convert.toHtml(err.toString('utf8')));
    });

    testProcess.on('exit', (code) => {
      code === 0 && !errorFlag && app.ws.send('done');
      console.log('Test process exited with code ' + code);
    });

    res.json('success');
  });

  router.post('/fundAdmin', (req, res) => {
    const targetSite = req.body.targetSite;
    const nodeArgs = [`${testDir}/fundraiserAdmin.js`];
    if (req.body.targetSite) {
      nodeArgs.push('--site');
      nodeArgs.push('onemission');
      nodeArgs.push('--siteUrl');
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
      //   app.ws.send('error: ' + textChunk);
      // }
      const htmlText = convert.toHtml(textChunk);
      if (textChunk.indexOf('→ Screenshot:') !== -1) {
        let parsedPath = textChunk.slice(textChunk.indexOf(ssDir) + ssDir.length);
        parsedPath = parsedPath.split('\n')[0];
        app.ws.send('screenshot: ' + parsedPath);
      }
      app.ws && app.ws.send(htmlText);
    });

    testProcess.stderr.on('data', (err) => {
      const msg = err.toString('utf8');
      console.log('stderr: ',  err.toString('utf8'));
      if (msg.indexOf('WARNING:') === -1) {
        errorFlag = true;
        app.ws.send('error: ' + convert.toHtml(err.toString('utf8')));
      }
    });

    testProcess.on('exit', (code) => {
      code === 0 && !errorFlag && app.ws.send('done');
      console.log('Test process exited with code ' + code);
    });

    res.json('success');
  });

  return router;
}

