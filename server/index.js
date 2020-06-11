/* eslint-disable @typescript-eslint/explicit-function-return-type */
const express = require('express');
const path = require('path');
const got = require('got');
const bodyParser = require('body-parser');

const { ICREW_PREFIX, PORT, APIkey, APIsecret } = require('./config.js');
const authenticate = require('./authenticate');
const reservation = require('./reservation');
const availability = require('./availability');

if (!APIkey || !APIsecret) {
  console.error('Missing API_KEY or API_SECRET');
  process.exit(1);
}

const icrewAPI = got.extend({
  prefixUrl: ICREW_PREFIX,
});

const app = express();

app.use(express.static(path.resolve(__dirname, '../ui/build')));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

authenticate(app, icrewAPI);
reservation(app, icrewAPI);
availability(app, icrewAPI);

// All remaining requests return the React app, so it can handle routing.
app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, '../ui/build', 'index.html'));
});

app.listen(PORT, () => console.error(`Server listening on port ${PORT} (pid: ${process.pid})`));
