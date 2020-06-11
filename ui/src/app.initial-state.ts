/* eslint-disable @typescript-eslint/camelcase */
import moment from 'moment';

import environment from './environments/environment';

export type AppState = {
  step: string;
  autz?: AuzState;
  availableBoats?: BoatInfo[];
  myReservation: Reservation;
  reservations?: {[date: string]: number};
  pihanga: {
    reservationForm?: PiResFormState;
  };
};

export type BoatInfo = {
  csFID: string;
  csMake: string;
  csName: string;
  csSAID: string; // boat ID
  csSeats: string;
  csType: string; // "sc"
  csWeightClass: string;
}

export type Reservation = {
  from: string;
  boatID: string;
  boatName: string;
}

export type AuzState = {
  cainfo: string;
  clubfid: string;
  clubname: string;
  clubsaid: string;
  cpatable: string;
  firstname: string;
  lastname: string;
  memberfid: string;
  membersaid: string;
  message: string;
  tilename: string;
  autzToken: string;
  sessionKey: string;
};

export type PiResFormState = {
  values?: {
    day: string;
    startTime: string;
  };
};

const state = {
  step: 'logonForm',
  pihanga: {
    reservationForm: {
      values: {
        day: moment().add(1, 'days').format('YYYY-MM-DD'),
      },
    },
  },
} as AppState;

export default state;

if (environment.debugEnabled) {
  // state.step = 'reservationOK';

  // state.myReservation = {
  //   from: '2020-06-12T07:00:00+10:00',
  //   boatID: 'fbf968ab-a5de-11e7-8c9e-008cfa5dabc8',
  //   boatName: 'Scud',
  // };

  // state.reservations = {
  //   '2020-06-09T06:00:00+00:00': 2,
  //   '2020-06-09T06:30:00+00:00': 4,
  //   '2020-06-09T06:45:00+00:00': 1,
  //   '2020-06-09T07:15:00+00:00': 2,
  //   '2020-06-09T07:45:00+00:00': 1,
  //   '2020-06-09T12:45:00+00:00': 1,
  //   '2020-06-10T06:15:00+00:00': 1,
  //   '2020-06-10T06:30:00+00:00': 3,
  //   '2020-06-10T06:45:00+00:00': 1,
  //   '2020-06-10T07:00:00+00:00': 2,
  //   '2020-06-10T07:30:00+00:00': 1,
  //   '2020-06-11T07:00:00+00:00': 2,
  //   '2020-06-11T07:15:00+00:00': 3,
  //   '2020-06-12T06:45:00+00:00': 3,
  //   '2020-06-13T07:00:00+00:00': 2,
  //   '2020-06-13T07:30:00+00:00': 1,
  //   '2020-06-13T08:15:00+00:00': 2,
  //   '2020-06-13T08:30:00+00:00': 4,
  //   '2020-06-14T08:00:00+00:00': 1,
  //   '2020-06-16T06:00:00+00:00': 1,
  // };
  // state.autz = {
  //   cainfo: '5e7dd19efecbddc5e61ccf98e470a921e39f8afb8d1594f1c0e0cfa0bc3b00c3',
  //   clubfid: '33',
  //   clubname: 'NSRC',
  //   clubsaid: 'a0c8f297-4b1d-c96a-9fe3-8b8470a26e96',
  //   cpatable: 'AttIntl',
  //   firstname: 'Max',
  //   lastname: 'Ott',
  //   memberfid: '2002',
  //   membersaid: '2bd19e66-be6e-c1cf-6bd6-6adc126ca485',
  //   message: 'Authentication successful',
  //   tilename: 'Max O',

  //   autzToken: 'MmJkMTllNjYtYmU2ZS1jMWNmLTZiZDYtNmFkYzEyNmNhNDg1OjVjODUxYTczLWNjODEtZTEwZC1mYmJiLWIyNTJhNzJiZDJmNQ==',
  //   sessionKey: '7f3ecc0e7b5eb597fda1b11bf71c8ee9',
  // };
}
