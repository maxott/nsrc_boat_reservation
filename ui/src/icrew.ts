/* eslint-disable object-curly-newline */
import { sha256 } from 'js-sha256';
import { 
  PiRegister, action, ReduxAction, registerGET, update, getPihangaState, getState, registerPOST, registerActions, dispatchFromReducer,
} from '@pihanga/core';
import moment from 'moment';

import { AppState, AuzState, PiResFormState } from './app.initial-state';

const Domain = 'ICREW';
export const ACTION_TYPES = registerActions(Domain, ['LOGON_OK', 'LOGON_ERR']);


type SubmitAction = ReduxAction & {
  cardID: string;
}

type LoginSubmitAction = SubmitAction & {
  userID: string;
  password: string;
};

export type ResSubmitAction = SubmitAction & {
  day: string;
  startTime: string;
  boat: string; // boat ID
}

type FormValueChangedAction = ReduxAction & {
  fieldID: string;
  value: string;
}

type LogonResultAction = ReduxAction & {
  reply: {
    authenticate: {
      sessionKey: string;
    };
  };
};

type RsvReply = {
  crewreservations: {
    id: string;
    url: string;
    shell: string; // Boat name
    reservedBy: string;
    start: string; // "2020-06-09T06:00:00+00:00"
    end: string;
  }[];
};

export function init(register: PiRegister): void {
  registerGET({
    name: 'logon',
    url: '/authenticate?user_id=:userID&pw_hash=:pw_hash',
    trigger: action('PI_FORM', 'FORM_SUBMIT'),
    guard: (a: ReduxAction) => {
      const { cardID } = a as SubmitAction;
      return cardID === 'logonForm';
    },
    request: (a: ReduxAction) => {
      const { userID, password } = a as LoginSubmitAction;
      const pwh = sha256(password);
      // eslint-disable-next-line @typescript-eslint/camelcase
      return { userID, pw_hash: pwh };
    },
    reply: (state, reply) => {
      const status = reply.status;
      if (status === 'ok') {
        delete reply.status;
        dispatchFromReducer(ACTION_TYPES.LOGON_OK, {});
        const s = update(state, ['alertMsg'], null);
        const s2 = update(s, ['step'], 'reservationForm');
        return update(s2, ['autz'], reply.authenticate);
      } else {
        console.log('EEEE', reply?.authenticate?.message);
        const m = reply?.authenticate?.message || '???';
        const rx = m.match(/<p>([^.]*)/);
        const message = rx ? rx[1] : m;
        dispatchFromReducer(ACTION_TYPES.LOGON_ERR, { message });
        return update(state, ['alertMsg'], message);
      }
    },
    error: (state) => state,
  });

  registerGET({
    name: 'crewreservations',
    url: '/crewreservations?session_id=:sessionId',
    trigger: ACTION_TYPES.LOGON_OK,
    request: (_, s) => {
      const sessionId = (s as AppState).autz?.sessionKey || '???';
      return { sessionId };
    },
    reply: (state, reply) => {
      const { crewreservations } = reply as RsvReply;
      const reservations = {} as {[k: string]: number};
      crewreservations.forEach((r) => {
        const { start } = r;
        if (reservations[start]) {
          reservations[start] += 1;
        } else {
          reservations[start] = 1;
        }
      });
      console.log('REV_RPLY', reservations, reply);
      return update(state, ['reservations'], reservations);
    },
    error: (state) => state,
  });

  // pihanga: {
  //   autz: {
  //     first_name: 'Max',
  //     last_name: 'Ott',
  //     club_name: 'NSRC',
  //     member_id: '2bd19e66-be6e-c1cf-6bd6-6adc126ca485',
  //     session_id: '7295746a31c19ad7abeb9c7da0247ac4',
  //     auth_token: '6b54cc5c-1f84-4855-13fa-623183a90f81'
  //   },
  //   reservationForm: {
  //     values: {
  //       day: '08:06:2020',
  //       startTime: '2'
  //     }
  //   }

  registerGET({
    name: 'availableShells',
    url: '/getavailableshells?from=:from&boatsize=:boatsize&clubfid=:clubfid&autzToken=:autzToken',
    trigger: action('PI_FORM', 'VALUE_CHANGED'),
    guard: (a, state) => {
      const { fieldID } = a as FormValueChangedAction;
      if (fieldID !== 'day' && fieldID !== 'startTime') {
        return false;
      }
      const s = state as AppState;
      const v = s.pihanga.reservationForm?.values;
      if (!v) return false;
      const { day, startTime } = v;
      return !!day && !!startTime;
    },
    request: (a, state) => {
      const s = state as AppState;
      const fv = s.pihanga.reservationForm?.values!;
      const { day, startTime } = fv;
      const from = moment(day).minute(Number(startTime)).format();
      const { clubfid, autzToken } = s.autz!;
      // eslint-disable-next-line object-curly-newline
      return { from, boatsize: 1, clubfid, autzToken };
    },
    reply: (state, reply) => {
      console.log('REPLYX', reply);
      const { status } = reply;
      if (status === 'ok') {
        delete reply.status;
        return update(state, ['availableBoats'], reply.boats);
      } else {
        return state;
      }
    },
    error: (state) => state,
  });

  // boatsaid, oarssaid,
  // from, duration,
  // boattype,
  // membersaid,
  // clubfid, autzToken,
  registerPOST({
    name: 'reservation',
    url: '/reservation',
    trigger: action('PI_FORM', 'FORM_SUBMIT'),
    guard: (a: ReduxAction) => {
      const { cardID } = a as SubmitAction;
      return cardID !== 'logonForm';
    },
    request: (a, state) => {
      const { day, startTime, boat } = a as ResSubmitAction;
      const from = moment(day).minute(Number(startTime)).format();
      const s = state as AppState; // getPihangaState('reservationForm') as PiResFormState;

      const { membersaid, clubfid, autzToken } = s.autz!;
      return [{ boatsaid: boat, from, membersaid, clubfid, autzToken }, {}];
    },
    reply: (state, reply) => {
      console.log('RESV REPLY', reply);
      const { status } = reply;
      if (status === 'ok') {
        return update(state, ['step'], 'reservationOK');
      } else {
        return state;
      }
    },
    error: (state, reply) => {
      console.error('POST /reservation', reply);
      const msg = reply.error?.response?.message || 'Unspecified error';
      return update(state, ['alertMsg'], msg);
    },
  });
}
