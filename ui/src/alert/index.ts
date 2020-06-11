import { registerActions, PiRegister } from '@pihanga/core';

import { AlertComponent } from './alert.component';

const Domain = 'PI_ALERT';
export const ACTION_TYPES = registerActions(Domain, ['CLOSE']);

export function init(register: PiRegister): void {
  register.cardComponent({
    name: 'PiAlert',
    component: AlertComponent,
    events: {
      onClose: ACTION_TYPES.CLOSE,
    },
  });
}
