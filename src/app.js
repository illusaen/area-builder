'use strict';

import { prompt } from 'inquirer';
import { stripIndent } from 'common-tags';
import fs from 'fs';
import moment from 'moment';
import store from './models/store';
import { menu_area, create_area, edit_area, select_area, delete_area } from './prompts/area';
import { menu_room, create_room, edit_room, select_room, delete_room } from './prompts/room';

class App {
  static area_create_area() {
    prompt(create_area()).then(answers => {
      store.addArea(answers.name, answers.respawn, answers.instanced);
      return this.area_menu_area();
    });
  }

  static area_select_area() {
    const area_list = select_area();
    prompt(area_list).then(answers => {
      const index = this._validateAreaIndex(area_list.choices, answers.select_area);
      if (index !== undefined) {
        store.setSelectedArea(index);
        return this.area_menu_area();
      }
    });
  }

  static area_edit_area() {
    prompt(edit_area()).then(answers => {
      store.configureArea(answers.name, answers.respawn, answers.instanced);
      return this.area_menu_area();
    });
  }

  static area_delete_area() {
    prompt(delete_area()).then(answers => {
      if (answers.delete_area) {
        store.deleteArea();
      }
      return this.area_menu_area();
    })
  }

  static _validateAreaIndex(choices, answer) {
    const index = choices.indexOf(answer);
    if (isNaN(index) || index < 0 || index >= store.numberOfAreas) {
      if (index === choices.length - 1) {
        this.area_menu_area(); // Goes back in menu since 'Back' is always appended to the back
        return;
      }
      console.error('ERROR: Area not found when trying to select area!');
      return;
    }

    return index;
  }

  static room_menu_room() {
    prompt(menu_room()).then(answers => {
      return answers.menu_room === 'back' ? this.area_menu_area() : this['room_' + answers.menu_room]();
    });
  }

  static room_create_room() {
    prompt(create_room()).then(answers => {
      store.addRoom(answers.name, answers.description, answers.terrain, answers.direction);
      return this.room_menu_room();
    });
  }

  static room_select_room() {
    const room_list = select_room();
    prompt(room_list).then(answers => {
      const index = this._validateRoomIndex(room_list.choices, answers.select_room);
      if (index !== undefined) {
        store.setSelectedRoom(index);
        return this.room_menu_room();
      }
    });
  }

  static _validateRoomIndex(choices, answer) {
    const choiceIndex = choices.indexOf(answer);
    if (choiceIndex === choices.length - 1) {
      this.room_menu_room();
      return;
    }

    const nonNormalizedIndex = store.rooms.findIndex(room => room.id === answer);
    if (isNaN(nonNormalizedIndex) || nonNormalizedIndex < 0 || nonNormalizedIndex >= store.rooms.length) {
      console.error('ERROR: Room not found when trying to select room!');
      return;
    }

    return nonNormalizedIndex;
  }

  static room_edit_room() {
    prompt(edit_room()).then(answers => {
      store.configureRoom(answers.name, answers.description, answers.terrain);
      return this.room_menu_room();
    });
  }

  static room_delete_room() {
    prompt(delete_room()).then(answers => {
      if (answers.delete_room) {
        store.deleteRoom();
      }
      return this.room_menu_room();
    });
  }

  static area_menu_area() {
    prompt(menu_area()).then(answers => {
      if (answers.menu_area === 'quit') {
        console.log('Goodbye!');
        return;
      }
      const prefix = answers.menu_area.indexOf('room') > 0 ? 'room' : 'area';
      return this[prefix + '_' + answers.menu_area]();
    });
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
      if (err) {
        throw err;
      }

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

  static area_save_area() {
    this._saveArea(store.selectedAreaIndex, false);
    this.area_menu_area();
  }

  static area_save_all() {
    store.areas.forEach((_, index) => {
      this._saveArea(index);
    });
  }

  static main() {
    console.log('Welcome to the area wizard.');
    return this.area_menu_area();
  }
}

App.main();
