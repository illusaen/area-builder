'use strict';

import AreaManager from './area';
import store from '../mobx/store';
import FSWriter from '../disk';

class AppManager {
  static async save_area() {
    await FSWriter.saveArea(store.areaStore.selected, store.roomStore.rooms, false);
    await AreaManager.menu_area();
  }

  static async save_all() {
    for (let index = 0; index < store.areaStore.numberOfAreas; index++) {
      await FSWriter.saveArea(store.areaStore.area(index).get(), store.roomStore.inArea(index).get(), true);
    }
  }

  static async quit() {
    return console.log('Goodbye!');
  }
}

export default AppManager;
