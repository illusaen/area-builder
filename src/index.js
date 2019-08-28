'use strict';

import { configure } from 'mobx';
import AreaManager from './ui/cli/area';
import RootStore from './mobx/store/app';

configure({
   enforceActions: 'always',
   computedRequiresReaction: false,
});

AreaManager.menu_area().then();
