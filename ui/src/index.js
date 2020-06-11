
import { start as pihangaStart } from '@pihanga/core';
import { init as materialInit, RootComponent } from '@pihanga/material-ui';

import initialReduxState from './app.initial-state';
import initialCards from './app.pihanga';
import { init as initReducers } from './app.reducers';
import environment from './environments/environment';
import { init as icrewInit } from './icrew';

// Need to move to @pihanga/material
import { init as alertInit } from './alert';

// eslint-disable-next-line no-undef
const rootEl = document.getElementById('root');

/**
 * Setup environment for plugins and collect all their init function.
 */
const inits = [
  materialInit, alertInit,
  icrewInit,
  initReducers,
];

pihangaStart({
  rootEl,
  rootComponent: RootComponent,
  inits,
  initialReduxState,
  initialCards,
  environment,
});
