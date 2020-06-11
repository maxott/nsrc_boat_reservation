const Promise = require('promise');

const { APIkey, APIsecret } = require('./config.js');

module.exports.asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(next);
};

module.exports.notAuthenticated = (res) => {
  res.status(401).send({ status: 'error', errMsg: 'Not authenticated' });
};

module.exports.missingParam = (name, res) => {
  res.status(400).send({ status: 'error', errMsg: `Missing parameter '${name}'` });
};

module.exports.getToken = (p1, p2) => {
  const rt = unescape(encodeURIComponent(`${p1}:${p2}`));
  const buff = Buffer.from(rt);
  const token = buff.toString('base64');
  return token;
}

// Extract session key from cookie
module.exports.getSessionKey = async (rmp) => {
  const rm = await rmp;
  const cookie = rm.headers['set-cookie'];
  // console.log("COOKIE", typeof cookie[0], cookie[0]);
  const m = cookie[0].match(/PHPSESSID=([^;]*)/);
  if (!m) throw new Error(`Can't find PHP session ID in cookie '${cookie}'`);
  const key = m[1];
  return key;
}

module.exports.getHeaders = (autzToken, clubfid) => {
  const autz = `Basic ${autzToken}`;
  const h = {
    Authorization: autz,
    'x-icrew-apikey': APIkey,
    'x-icrew-apisecret': APIsecret,
  };
  if (clubfid) {
    h['x-icrew-clubkey'] = clubfid;
  }
  return h;
}


