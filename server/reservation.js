const moment = require('moment');
const FormData = require('form-data');

const { asyncMiddleware, getHeaders, missingParam, notAuthenticated  } = require('./utils');
const { DEF_RESERVATION_DURATION_MIN } = require('./config.js');

const RESERVATION_M = 'rescalendardata';
const DEF_CREW_ORG = 'NSRC';

module.exports = (app, icrewAPI) => {
  app.get('/crewreservations', asyncMiddleware(async (req, res) => {
    const from = req.query.from ? moment(req.query.from) : moment();
    const to = req.query.to ? moment(req.query.to) : moment(from).add(7, 'days');
    const crewOrg = req.query.crew_org || DEF_CREW_ORG;
    const sessionId = req.query.session_id;
  
    if (!sessionId) {
      return missingParam('session_id', res);
    }
    get(from, to, crewOrg, sessionId, res, icrewAPI);
  }));

  app.post('/reservation', asyncMiddleware(async (req, res) => {
    // console.log('RSV BODY', req.body);
    const {
      boatsaid, oarssaid, boattype, membersaid, clubfid, autzToken,
    } = req.body;
    const from = req.body.from ? moment(req.body.from) : moment();
    const duration = req.body.duration ? Number(req.body.duration) : DEF_RESERVATION_DURATION_MIN;
    const [code, rj] = await post(
      boatsaid, oarssaid,
      from, duration,
      boattype,
      membersaid,
      clubfid, autzToken, icrewAPI
    );
    return res.status(code).json(rj);
  }));
};

async function get(from, to, crewOrg, sessionId, res, icrewAPI) {
  const cookie = `PHPSESSID=${sessionId}`;

  const rmp = icrewAPI(RESERVATION_M, {
    searchParams: {
      crewOrg,
      start: from.format('yyyy-MM-DD'),
      end: to.add(7, 'days').format('yyyy-MM-DD'),
      _: Math.round(Math.random() * 1000000), // avoid caching ?
    },
    headers: {
      cookie,
    },
  });
  const rm = await rmp;
  if (rm.body.startsWith('not authenticated')) {
    notAuthenticated(res);
    return;
  }
  const rj = await rmp.json();
  const rv = rj
    .filter((j) => j.url.startsWith('crewreservation'))
    .filter((j) => moment(j.start).isBetween(from, to))
    .map((j) => {
      const n = j.name;
      const sna = n.split('/');
      const shell = sna[0].trim();
      const reservedBy = sna[1].split('-')[1].trim();
      return {
        id: j.id,
        url: j.url,
        shell,
        reservedBy,
        start: j.start,
        end: j.end,
      };
    });
  res.json({ crewreservations: rv });
}

async function post(
  boatsaid, oarssaid,
  from, duration,
  boattype,
  membersaid,
  clubfid, autzToken,
  icrewAPI,
) {
  const to = moment(from).add(duration, 'minutes');
  const form = new FormData();
  form.append('cmsaid', membersaid);
  form.append('cssaid', boatsaid);
  if (oarssaid) form.append('coarsaid', oarssaid);
  form.append('resdate', from.format('YYYY-MM-DD'));
  form.append('starttime', from.format('hh:mm:ss'));
  form.append('endtime', to.format('hh:mm:00'));
  form.append('note', '');
  form.append('type', boattype || 'sc');
  form.append('cressaid', generateGUID());
  // console.log("TRSV FORM:", form);

  const headers = getHeaders(autzToken, clubfid);
  headers['x-icrew-action'] = 'create';
  const url = 'apiv1.php/reservations';
  // console.log("TRSV Before:", headers);

  const rj = await icrewAPI.post(url, { body: form, headers }).json();
  // console.log("TRSV AFTER:", rj);

  const { code } = rj;
  return [code, rj];
}

function generateGUID() {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}