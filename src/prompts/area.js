'use strict';

import store from '../models/store';
import { filterChoices } from '../utils';

const _menu_prompt_choice_template = [
  {
    name: 'Create new area',
    value: 'create_area'
  }, {
    name: 'Select an area',
    value: 'select_area',
    needs: 'numberOfAreas'
  }, {
    name: 'Edit selected area metadata',
    value: 'edit_area',
    needs: 'hasSelectedArea'
  }, {
    name: 'Create or edit rooms for selected area',
    value: 'menu_room',
    needs: 'hasSelectedArea'
  }, {
    name: 'Delete selected area',
    value: 'delete_area',
    needs: 'hasSelectedArea'
  }, {
    name: 'Save selected area to YAML',
    value: 'save_area',
    needs: 'hasSelectedArea'
  }, {
    name: 'Save all areas to YAML',
    value: 'save_all',
    needs: 'numberOfAreas'
  }, {
    name: 'Quit',
    value: 'quit'
  },
];
const menu_area = () => {
  const message = store.hasSelectedArea ?
    `Areas: ${store.numberOfAreas}, Selected: ${store.selectedArea.name}, Rooms in Area: ${store.roomsInArea.length}` :
    'What would you like to do?';
  const choices = filterChoices(_menu_prompt_choice_template);
  return {
    type: 'rawlist',
    name: 'menu_area',
    message,
    choices
  };
}

const _create_area_prompt_choice_template = isCreating => [
  {
    type: 'input',
    name: 'name',
    message: 'Name of area:',
    validate: value => {
      if (!value.length) { return 'Please enter a value.'; }
      if (isCreating && store.doesAreaExist(value)) { return 'Area name already taken.'; }
      return true;
    }
  }, {
    type: 'number',
    name: 'respawn',
    message: 'Number of minutes to respawn:',
    default: 20
  }, {
    type: 'confirm',
    name: 'instanced',
    message: 'Is this area instanced?',
    default: false,
  },
];
const create_area = () => {
  return _create_area_prompt_choice_template(true);
};

const edit_area = () => {
  return _create_area_prompt_choice_template(false).map(question => {
    return { ...question, default: store.selectedArea[question.name] };
  });
};

const select_area = () => {
  return {
    type: 'rawlist',
    name: 'select_area',
    message: 'Which area would you like to select?',
    choices: [...store.areaNames, 'Back'],
  };
};

const delete_area = () => {
  return {
    type: 'confirm',
    name: 'delete_area',
    message: `Are you sure you want to delete area '${store.selectedArea.name}'?`
  }
};

export { menu_area, create_area, edit_area, select_area, delete_area };