'use strict';

import { configure } from 'mobx';
import AreaManager from './ui/cli/area';
import RootStore from './mobx/store/app';

configure({
   enforceActions: 'always',
   computedRequiresReaction: true,
});

// const rootStore = new RootStore();
AreaManager.menu_area().then();
// const raw = require('./prompts/data.json');
// function ui(layer, text) {
//   const uiLayer = layer === 'react' ? React() : AreaManager.menu_area();
//   uiLayer.create(uiLayer.parse(text))
// }

// ui('react', rootStore);
// export { rootStore };
