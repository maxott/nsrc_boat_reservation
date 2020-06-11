const { asyncMiddleware, getToken, getSessionKey, missingParam } = require('./utils');
const { APIkey, APIsecret } = require('./config.js');

const AUTZ_M = 'apiv1.php/tokens';

module.exports = (app, icrewAPI) => {
  app.get('/authenticate', asyncMiddleware(async (req, res) => {
    const userId = req.query.user_id;
    const pswdHash = req.query.pw_hash;
    if (!userId) {
      return missingParam('user_id', res);
    }
    if (!pswdHash) {
      return missingParam('pw_hash', res);
    }

    const [code, rj] = await authenticate(userId, pswdHash, icrewAPI);
    return res.status(code).json(rj);
  }));
};

async function authenticate(userId, pswdHash, icrewAPI) {
  const autz = `Basic ${getToken(userId, pswdHash)}`;
  const headers = {
    Authorization: autz,
    'x-icrew-apikey': APIkey,
    'x-icrew-apisecret': APIsecret,
    'x-icrew-device': 'server',
  };
  const rmp = icrewAPI.post(AUTZ_M, { headers });
  const rj = await rmp.json();
  // console.log('Authenticate: ', rj);
  const { code, status } = rj;
  delete rj.status;
  delete rj.code;
  if (status === 'ok') {
    rj.autzToken = getToken(rj.membersaid, rj.sessiontoken);
    delete rj.sessiontoken;

    // remove when we no longer need PHP session key
    const sessionKey = await getSessionKey(rmp);
    rj.sessionKey = sessionKey;
  }
  return [200, {
    status,
    code,
    authenticate: rj,
  }];
}


