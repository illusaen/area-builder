'use strict';

import store from '../store';
import { filterChoices, normalizeDirection } from '../utils';

const _menu_room_prompt_choice_template = [
  {
    name: 'Create new room',
    value: 'create_room'
  }, {
    name: 'Select different room',
    value: 'select_room',
    needs: 'roomsInArea'
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
    `Number: ${store.roomStore.rooms.length}, Selected: ${store.roomStore.selected.name} at {${store.roomStore.selected.coordinateString}}` :
    'What room function would you like to perform?';
  const choices = filterChoices(_menu_room_prompt_choice_template);
  return {
    type: 'rawlist',
    name: 'menu_room',
    message,
    choices
  };
}

const _terrains = ['city', 'field', 'hills', 'desert', 'swamp', 'ice', 'light_forest', 'deep_forest', 'jungle', 'mountain', 'water', 'deep_water', 'under_water', 'under_ground', 'air', 'lava', '_default'];
const _validateRoomDirection = value => {
  const match = normalizeDirection(value);
  if (!match) {
    return 'Please enter a valid direction.';
  }

  if (store.roomStore.exists(match).get()) {
    return `There is already a room in that direction!`;
  }

  return true;
}

const _validateEmpty = value => {
  if (!value.length) { return 'Please enter a value.'; }
  return true;
}
const _validateTerrain = value => {
  if (!value.length) { return 'Please enter a value.'; }
  if (!_terrains.filter(terrain => terrain === value).length) { return 'Invalid terrain.'; }
  return true;
}
const _create_room_prompt_choice_template = isCreating => {
  return [
    {
      type: 'input',
      name: 'direction',
      message: 'Direction from selected room (n, s, e, w, u, d)',
      when: _ => store.roomStore.hasSelectedRoom && isCreating,
      validate: value => _validateRoomDirection(value)
    }, {
      type: 'input',
      name: 'name',
      message: 'Room name:',
      validate: value => _validateEmpty(value)
    }, {
      type: 'input',
      name: 'description',
      message: 'Room description:'
    }, {
      type: 'input',
      name: 'terrain',
      message: `Terrain (${_terrains.join(', ')})`,
      default: '_default',
      validate: value => _validateTerrain(value)
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
