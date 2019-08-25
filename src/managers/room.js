'use strict';

import { prompt } from 'inquirer';
import { menu_room, create_room, edit_room, select_room, delete_room } from '../prompts/room';
import AreaManager from './area';
import store from '../models/store';
import { normalizeDirection } from '../utils';

class RoomManager {
  static async menu_room() {
    const menu_room_answers = await prompt(menu_room());
    return menu_room_answers.menu_room === 'back' ? await AreaManager.menu_area() : await this[menu_room_answers.menu_room]();
  }

  static async create_room() {
    const create_room_answers = await prompt(create_room());
    const direction = normalizeDirection(create_room_answers.direction);
    store.addRoom(create_room_answers.name, create_room_answers.description, create_room_answers.terrain, direction);
    await this.menu_room();
  }

  static async delete_room() {
    const delete_room_answers = await prompt(delete_room());
    if (delete_room_answers.delete_room) {
      store.deleteRoom();
    }
    await this.menu_room();
  }

  static async edit_room() {
    const edit_room_answers = await prompt(edit_room());
    store.configureRoom(edit_room_answers.name, edit_room_answers.description, edit_room_answers.terrain);
    await this.menu_room();
  }

  static async select_room() {
    const select_room_answers = await prompt(select_room());
    if (select_room_answers.select_room !== 'back') {
      const index = store.rooms.findIndex(room => room.id === select_room_answers.select_room);
      store.setSelectedRoom(index);
    }
    await this.menu_room();
  }
}

export default RoomManager;
