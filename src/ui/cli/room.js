'use strict';

import { prompt } from 'inquirer';
import AreaManager from './area';
import store from '../../mobx/store';
import { pageSize, RoomPrompts } from './index';
import { Terrains, validator } from '../data';
import { Directions } from '../../mobx/models/coordinate';

const menuChoices = [
  {
    name: 'Create new room',
    value: RoomPrompts.CREATE,
  }, {
    name: 'Select different room',
    value: RoomPrompts.SELECT,
    needs: 'rooms'
  }, {
    name: 'Edit selected room',
    value: RoomPrompts.EDIT,
    needs: 'hasSelectedRoom'
  }, {
    name: 'Delete room',
    value: RoomPrompts.DELETE,
    needs: 'hasSelectedRoom'
  }, {
    name: 'Back',
    value: RoomPrompts.BACK,
  }
];

class RoomManager {
  static async menu_room() {
    const message = store.roomStore.hasSelectedRoom ?
        `Number: ${store.roomStore.rooms.length}, Selected: ${store.roomStore.selected.name} at {${store.roomStore.selected.coordinates.string()}}` :
        'What room function would you like to perform?';
    const answers = await prompt({
      type: 'rawlist',
      pageSize,
      name: RoomPrompts.MENU,
      message,
      choices: store.filter(false, menuChoices)
    });
    const choice = answers[RoomPrompts.MENU];
    return choice === RoomPrompts.BACK ? await AreaManager.menu_area() : await this[choice]();
  }

  static async create_room() {
    const answers = await prompt(this._roomMetadataTemplate(true));
    store.roomStore.add(answers.name, answers.description.trim(), answers.terrain, answers.direction);
    await this.menu_room();
  }

  static async delete_room() {
    const answers = await prompt({
      type: 'confirm',
      name: RoomPrompts.DELETE,
      message: `Are you sure you want to delete room '${store.roomStore.selected.id}' in area ${store.areaStore.selected.name}'?`
    });
    if (answers[RoomPrompts.DELETE]) {
      store.roomStore.delete();
    }
    await this.menu_room();
  }

  static async edit_room() {
    const answers = await prompt(this._roomMetadataTemplate(false).map(question => {
      return { ...question, default: store.roomStore.selected[question.name] };
    }));
    store.roomStore.edit(answers.name, answers.description, answers.terrain);
    await this.menu_room();
  }

  static async select_room() {
    const answers = await prompt({
      type: 'rawlist',
      pageSize,
      name: RoomPrompts.SELECT,
      message: 'Which room would you like to select?',
      choices: [...store.roomStore.ids, 'Back'],
    });
    const choice = answers[RoomPrompts.SELECT];
    if (choice !== RoomPrompts.BACK) {
      store.roomStore.select(choice);
    }
    await this.menu_room();
  }

  static _roomMetadataTemplate(isCreating) {
    return [
      {
        type: 'input',
        name: 'direction',
        message: 'Direction from selected room (n, s, e, w, u, d)',
        when: () => store.roomStore.hasSelectedRoom && isCreating,
        validate: value => validator(() => {
          const match = Directions.normalize(value);
          if (!match) {
            return 'Please enter a valid direction.';
          }

          if (store.roomStore.exists(match).get()) {
            return `There is already a room in that direction!`;
          }

          return true;
        })(value)
      }, {
        type: 'input',
        name: 'name',
        message: 'Room name:',
        validate: value => validator(undefined)(value)
      }, {
        type: 'editor',
        name: 'description',
        message: 'Room description:'
      }, {
        type: 'input',
        name: 'terrain',
        message: `Terrain (${Terrains.values().join(', ')})`,
        default: '_default',
        validate: value => validator(() => {
          if (!Terrains.has(value)) {
            return 'Invalid terrain.';
          }
          return true;
        })(value)
      }
    ];
  }
}

export default RoomManager;
