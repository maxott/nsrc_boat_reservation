const moment = require('moment');

const { asyncMiddleware, getHeaders } = require('./utils');
const { DEF_RESERVATION_DURATION_MIN } = require('./config.js');

module.exports = (app, icrewAPI) => {
  app.get('/getavailableshells', asyncMiddleware(async (req, res) => {
    const {
      boatsize, boattype, clubfid, autzToken,
    } = req.query;
    const from = req.query.from ? moment(req.query.from) : moment();
    const duration = req.query.duration ? Number(req.query.duration) : DEF_RESERVATION_DURATION_MIN;
    const [code, rj] = await getAvailableShells(from, duration, boatsize,
      boattype, clubfid, autzToken, icrewAPI);
    return res.status(code).json(rj);
  }));

  app.get('/getavailableoars', asyncMiddleware(async (req, res) => {
    const { boattype, clubfid, autzToken } = req.query;
    const from = req.query.from ? moment(req.query.from) : moment();
    const duration = req.query.duration ? Number(req.query.duration) : DEF_RESERVATION_DURATION_MIN;
    const [code, rj] = await getAvailableOars(from, duration,
      boattype, clubfid, autzToken, icrewAPI);
    return res.status(code).json(rj);
  }));
}

async function getAvailableShells(from, duration, boatsize, boattype, clubfid, autzToken, icrewAPI) {
  const to = moment(from).add(duration, 'minutes');

  const searchParams = {
    boatsize: boatsize || '3',
    boattype: boattype || 'sc',
    date: from.format('YYYY-MM-DD'),
    starttime: from.format('hh:mm:ss'),
    endtime: to.format('hh:mm:00'),
  };
  // console.log('getavailableshells data:', searchParams);
  const headers = getHeaders(autzToken, clubfid);
  const url = `apiv1.php/clubs/${clubfid}/reservations/boats`;
  const rj = await icrewAPI.get(url, { searchParams, headers }).json();
  // console.log('RMP', rj);

  const { code, status, data } = rj;
  if (status !== 'ok') {
    return [200, rj];
  }
  let boats = [];
  if (data) {
    boats = data.map((e) => ({
      csName: e.csName,
      csFID: e.csFID,
      csSAID: e.csSAID,
      csSeats: e.csSeats,
      csType: e.csType,
      csMake: e.csMake,
      csWeightClass: e.csWeightClass,
    }));
  }
  return [200, {
    status,
    code,
    boats,
  }];
}

async function getAvailableOars(from, duration, boattype, clubfid, autzToken, icrewAPI) {
  const to = moment(from).add(duration, 'minutes');

  const searchParams = {
    boattype: boattype || 'sc',
    date: from.format('YYYY-MM-DD'),
    starttime: from.format('hh:mm:ss'),
    endtime: to.format('hh:mm:00'),
  };
  const headers = getHeaders(autzToken, clubfid);
  const url = `apiv1.php/clubs/${clubfid}/reservations/oars`;
  const rj = await icrewAPI.get(url, { searchParams, headers }).json();
  // console.log('RMP', rj);

  const { code, status, data } = rj;
  if (status !== 'ok') {
    return [200, rj];
  }
  let oars = [];
  if (data) {
    oars = data.map((e) => ({
      coarName: e.coarName,
      coarFID: e.coarFID,
      coarSAID: e.coarSAID,
      coarType: e.coarType,
      coarMake: e.coarMake,
    }));
  }
  return [200, {
    status,
    code,
    oars,
  }];
}