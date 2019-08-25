'use strict';

import fs from 'fs';
import moment from 'moment';
import AreaManager from './area';
import store from '../store';

class AppManager {
  static async save_area() {
    await this._saveArea(store.areaStore.selectedIndex, false);
    await AreaManager.menu_area();
  }

  static async save_all() {
    for (let index = 0; index < store.areaStore.numberOfAreas; index++) {
      await this._saveArea(index);
    }
  }

  static async quit() {
    return console.log('Goodbye!');
  }

  static _writeFile(path, areaIndex, isArea, shouldLog) {
    const data = isArea ? store.areaStore.stringValue(areaIndex).get() : store.roomStore.stringValue(areaIndex).get();
    const filePath = path + (isArea ? '/manifest.yml' : '/rooms.yml');
    fs.writeFile(filePath, data, { flag: 'w' }, error => {
      if (error) { throw error; }
      if (shouldLog) {
        console.log(`${filePath} written.`);
      }
    });
  }

  static _saveArea(index, shouldLog=true) {
    const directory = './exports';
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    };

    const areaDirectory = directory + `/${store.areaStore.area(index).id}-${moment().format('YYYY-MM-DD--HH-mm-ss')}`;
    fs.mkdirSync(areaDirectory);
    this._writeFile(areaDirectory, index, true, shouldLog);
    this._writeFile(areaDirectory, index, false, shouldLog);
  }
}

export default AppManager;
