'use strict';

import { prompt } from 'inquirer';
import RoomManager from './room';
import store from '../../mobx/store';
import { FSReader, FSWriter } from '../../lib/disk';
import { validator } from '../data';
import { AreaPrompts, pageSize, RoomPrompts } from './index';

const menuChoices = [
  {
    name: 'Create new area',
    value: AreaPrompts.CREATE,
  }, {
    name: 'Select an area',
    value: AreaPrompts.SELECT,
    needs: 'numberOfAreas',
  }, {
    name: 'Edit selected area metadata',
    value: AreaPrompts.EDIT,
    needs: 'hasSelectedArea',
  }, {
    name: 'Create or edit rooms for selected area',
    value: RoomPrompts.MENU,
    needs: 'hasSelectedArea',
  }, {
    name: 'Load an area folder',
    value: AreaPrompts.LOAD,
  }, {
    name: 'Load all areas in folder',
    value: AreaPrompts.LOAD_ALL,
  }, {
    name: 'Delete selected area',
    value: AreaPrompts.DELETE,
    needs: 'hasSelectedArea',
  }, {
    name: 'Save selected area to YAML',
    value: AreaPrompts.SAVE,
    needs: 'hasSelectedArea',
  }, {
    name: 'Save all areas to YAML',
    value: AreaPrompts.SAVE_ALL,
    needs: 'numberOfAreas',
  }, {
    name: 'Quit',
    value: AreaPrompts.QUIT,
  },
];

class AreaManager {
  static async menu_area() {
    console.log('Welcome to the area wizard.');

    const message = store.areaStore.hasSelectedArea ?
        `Areas: ${store.areaStore.numberOfAreas}, Selected: ${store.areaStore.selected.name}, Rooms in Area: ${store.roomStore.rooms.length}` :
        'What would you like to do?';
    const answers = await prompt({
      type: 'rawlist',
      name: AreaPrompts.MENU,
      pageSize,
      message,
      choices: store.filter(true, menuChoices)
    });
    const choice = answers[AreaPrompts.MENU];

    if (choice === RoomPrompts.MENU) {
      await RoomManager.menu_room();
    } else {
      await this[choice]();
    }
  }

  static async create_area() {
    const answers = await prompt(this._areaMetadataTemplate());
    store.areaStore.add(answers.name, answers.respawn, answers.instanced);
    await this.menu_area();
  }

  static async delete_area() {
    const answers = await prompt({
      type: 'confirm',
      name: AreaPrompts.DELETE,
      message: `Are you sure you want to delete area '${store.areaStore.selected.name}'?`
    });
    if (answers[AreaPrompts.DELETE]) {
      store.areaStore.delete();
    }
    await this.menu_area();
  }

  static async edit_area() {
    const answers = await prompt(this._areaMetadataTemplate().map(question => {
      return { ...question, default: store.areaStore.selected[question.name] };
    }));
    store.areaStore.edit(answers.name, answers.respawn, answers.instanced);
    await this.menu_area();
  }

  static async select_area() {
    const answers = await prompt({
      type: 'rawlist',
      pageSize,
      name: AreaPrompts.SELECT,
      message: 'Which area would you like to select?',
      choices: [...store.areaStore.names, AreaPrompts.BACK],
    });
    const choice = answers[AreaPrompts.SELECT];
    if (choice !== AreaPrompts.BACK) {
      store.areaStore.select(choice);
    }
    await this.menu_area();
  }

  static async save_area() {
    await FSWriter.saveArea(store.areaStore.selected, store.roomStore.rooms, false);
    await this.menu_area();
  }

  static async save_all() {
    for (let index = 0; index < store.areaStore.numberOfAreas; index++) {
      await FSWriter.saveArea(store.areaStore.area(index).get(), store.roomStore.inArea(index).get(), true);
    }
  }

  static async load_area() {
    const answers = await prompt({
      type: 'rawlist',
      pageSize,
      name: AreaPrompts.LOAD,
      message: 'Load area(s)',
      choices: [...FSReader.listAreas(), AreaPrompts.BACK]
    });
    const choice = answers[AreaPrompts.LOAD];
    if (choice !== AreaPrompts.BACK) {
      await this._load(choice);
    }
    await this.menu_area();
  }

  static async load_all() {
    const areas = FSReader.listAreas();
    for (let index = 0; index < areas.length; index++) {
      await this._load(areas[index]);
    }
    await this.menu_area();
  }

  static async quit() {
    return console.log('Goodbye!');
  }

  static async _load(choice) {
    const { area, rooms } = await FSReader.loadArea(choice);
    store.areaStore.load(area);
    rooms.forEach(room => store.roomStore.load(room));
  }

  static _areaMetadataTemplate() {
    return [
      {
        type: 'input',
        name: 'name',
        message: 'Name of area:',
        validate: value => validator(undefined)(value)
      }, {
        type: 'input',
        name: 'respawn',
        message: 'Number of minutes to respawn:',
        default: 20,
        validate: value => validator(value => {
          if (!parseInt(value, 10)) {
            return 'Please enter a valid integer.';
          }
          return true;
        })(value)
      }, {
        type: 'confirm',
        name: 'instanced',
        message: 'Is this area instanced?',
        default: false,
      },
    ];
  }
}

export default AreaManager;
