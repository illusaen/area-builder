'use strict';

import store from '../mobx/store';
import { Directions } from '../mobx/models/coordinate';
import { Terrains, validator } from './data';

const _menu_room_prompt_choice_template = [
   {
      name: 'Create new room',
      value: 'create_room'
   }, {
      name: 'Select different room',
      value: 'select_room',
      needs: 'rooms'
   }, {
      name: 'Edit selected room',
      value: 'edit_room',
      needs: 'hasSelectedRoom'
   }, {
      name: 'Delete room',
      value: 'delete_room',
      needs: 'hasSelectedRoom'
   }, {
      name: 'Back',
      value: 'back'
   }
];
const menu_room = () => {
   const message = store.roomStore.hasSelectedRoom ?
      `Number: ${store.roomStore.rooms.length}, Selected: ${store.roomStore.selected.name} at {${store.roomStore.selected.coordinates.string()}}` :
      'What room function would you like to perform?';
   const choices = store.filter(false, _menu_room_prompt_choice_template).get();
   return {
      type: 'rawlist',
      name: 'menu_room',
      message,
      choices
   };
}

const _create_room_prompt_choice_template = isCreating => {
   return [
      {
         type: 'input',
         name: 'direction',
         message: 'Direction from selected room (n, s, e, w, u, d)',
         when: _ => store.roomStore.hasSelectedRoom && isCreating,
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

const create_room = () => _create_room_prompt_choice_template(true);

const edit_room = () => _create_room_prompt_choice_template(false).map(question => {
   return { ...question, default: store.roomStore.selected[question.name] };
});

const select_room = () => {
   return {
      type: 'rawlist',
      name: 'select_room',
      message: 'Which room would you like to select?',
      choices: [...store.roomStore.ids, 'Back'],
   }
}

const delete_room = () => {
   return {
      type: 'confirm',
      name: 'delete_room',
      message: `Are you sure you want to delete room '${store.roomStore.selected.id}' in area ${store.areaStore.selected.name}'?`
   };
}

export { menu_room, create_room, edit_room, select_room, delete_room };
