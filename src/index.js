'use strict';

import { configure } from 'mobx';
import AreaManager from './managers/area';

configure({
  enforceActions: 'always',
  computedRequiresReaction: true,
});

AreaManager.menu_area();
