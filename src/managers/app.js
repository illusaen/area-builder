'use strict';

import AreaManager from './area';
import store from '../mobx/store';
import { prompt } from 'inquirer';
import { FSReader, FSWriter } from '../lib/disk';

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

   static async load_area() {
      const choices = [...FSReader.listAreas(), 'BACK'];
      const load_answers = await prompt({
         type: 'rawlist',
         name: 'load_area',
         message: 'Load area(s)',
         choices
      });
      if (load_answers.load_area !== 'BACK') {
         const { area, rooms } = await FSReader.loadArea(load_answers.load_area);
         store.areaStore.load(area);
         rooms.forEach(room => store.roomStore.load(room));
      } 
      await AreaManager.menu_area();
   }

   static async quit() {
      return console.log('Goodbye!');
   }
}

export default AppManager;
