/* eslint-disable object-curly-newline */
import {
  action as toAction,
  update,
  PiRegister,
  ReduxState,
  ReduxAction,
} from '@pihanga/core';
import moment from 'moment';

import { ResSubmitAction } from './icrew';
import { AppState } from './app.initial-state';

export function init(register: PiRegister): void {
  register.reducer(toAction('PI_FORM', 'FORM_SUBMIT'), (state: ReduxState, a: ReduxAction) => {
    const { cardID } = a as ResSubmitAction;
    if (cardID !== 'reservationForm') return state;

    const { day, startTime, boat } = a as ResSubmitAction;
    const from = moment(day).minute(Number(startTime)).format();
    const bi = ((state as AppState).availableBoats || []).find((b) => b.csSAID === boat);
    const boatName = bi ? bi.csName : 'Unknown';
    return update(state, ['myReservation'], { from, boatID: boat, boatName });
  });
}
