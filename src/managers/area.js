'use strict';

import { prompt } from 'inquirer';
import { create_area, delete_area, edit_area, menu_area, select_area } from '../prompts/area';
import { contains } from '../utils';
import AppManager from './app';
import RoomManager from './room';
import store from '../store';

class AreaManager {
  static appManagerFunctions = ['save_area', 'save_all', 'quit'];
  static areaManagerFunctions = ['create_area', 'delete_area', 'edit_area', 'select_area'];
  static roomManagerFunctions = ['menu_room', 'create_room', 'delete_room', 'edit_room', 'select_room'];

  static async menu_area() {
    console.log('Welcome to the area wizard.');
    const menu_area_answers = await prompt(menu_area());
    const Class = this._dispatch(menu_area_answers.menu_area);
    Class[menu_area_answers.menu_area]();
  }

  static async create_area() {
    const create_area_answers = await prompt(create_area());
    store.areaStore.add(create_area_answers.name, create_area_answers.respawn, create_area_answers.instanced);
    await this.menu_area();
  }

  static async delete_area() {
    const delete_area_answers = await prompt(delete_area());
    if (delete_area_answers.delete_area) {
      store.areaStore.delete();
    }
    await this.menu_area();
  }

  static async edit_area() {
    const edit_area_answers = await prompt(edit_area());
    store.areaStore.edit(edit_area_answers.name, edit_area_answers.respawn, edit_area_answers.instanced);
    await this.menu_area();
  }

  static async select_area() {
    const questions = select_area();
    const select_area_answers = await prompt(questions);
    if (select_area_answers.select_area !== 'back') {
      store.areaStore.select(select_area_answers.select_area);
    }
    await this.menu_area();
  }

  static _dispatch(answer) {
    switch (true) {
      case contains(this.appManagerFunctions, answer): return AppManager;
      case contains(this.areaManagerFunctions, answer): return AreaManager;
      case contains(this.roomManagerFunctions, answer): return RoomManager;
    }
  }
}

export default AreaManager;
