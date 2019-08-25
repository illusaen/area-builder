'use strict';

import { stripIndent } from 'common-tags';
import fs from 'fs';
import moment from 'moment';
import store from '../models/store';

class AppManager {
  static async save_area() {
    this._saveArea(store.selectedAreaIndex, false);
    await this.menu_area();
  }

  static async save_all() {
    store.areas.forEach((_, index) => {
      this._saveArea(index);
    });
  }

  static async quit() {
    return console.log('Goodbye!');
  }

  static _formatArea(areaIndex) {
    const area = store.areas[areaIndex];
    let data = stripIndent`
      title: "${area.name}"
      behaviors:
        progressive-respawn:
          interval: ${area.respawn}
    `;
    return data += (area.instanced ? '\ninstanced: player' : '') + '\n';
  }

  static _formatRoom(areaIndex) {
    const data = store.rooms.filter(room => room.areaIndex === areaIndex).map(room => stripIndent`
      - id: ${room.id}
        title: "${room.name}"
        coordinates: [${room.coordinateString}]
        description: "${room.description}"
        metadata:
          terrain: "${room.terrain}"
    `).join('\n\n') + '\n';
    return data;
  }

  static _writeFile(path, areaIndex, isArea, shouldLog) {
    const data = isArea ? this._formatArea(areaIndex) : this._formatRoom(areaIndex);
    const filePath = path + (isArea ? '/manifest.yml' : '/rooms.yml');
    fs.writeFile(filePath, data, { flag: 'w' }, err => {
      if (err) { throw err; }
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

    const areaDirectory = directory + `/${store.areas[index].id}-${moment().format('YYYY-MM-DD--HH-mm-ss')}`;
    fs.mkdirSync(areaDirectory);
    this._writeFile(areaDirectory, index, true, shouldLog);
    this._writeFile(areaDirectory, index, false, shouldLog);
  }
}

export default AppManager;
