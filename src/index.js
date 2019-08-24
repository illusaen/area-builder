'use strict';

import { prompt } from 'inquirer';
import store from './models/store';

const menu_prompt = {
  type: 'rawlist',
  name: 'menu',
  message: 'What would you like to do?',
  choices: [
    {
      name: 'Create new area',
      value: 'create'
    },
    {
      name: 'Edit current area',
      value: 'edit'
    },
    {
      name: 'Create or edit rooms',
      value: 'room_menu'
    },
    {
      name: 'Save area to YAML',
      value: 'save'
    },
    {
      name: 'Save all areas to YAML',
      value: 'save_all'
    },
    {
      name: 'Quit',
      value: 'quit'
    },
  ]
};

const room_prompt = {
  type: 'rawlist',
  name: 'room_prompt',
  message: 'What room function would you like to perform?',
  choices: [
    {
      name: 'Create new room',
      value: 'create'
    },
    {
      name: 'Edit room',
      value: 'edit'
    },
    {

    },
    {
      name: 'Back',
      value: 'back'
    }
  ]
}

const room_questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Room name:'
  },
  {
    type: 'input',
    name: 'description',
    message: 'Room description:'
  },
  {
    type: 'expand',
    name: 'terrain',
    message: 'Terrain',
    default: '_default',
    choices: [
      'city', 'field', 'hills', 'desert', 'swamp', 'ice', 'light_forest', 'deep_forest', 'jungle', 'mountain', 'water', 'deep_water', 'under_water', 'under_ground', 'air', 'lava', '_default'
    ]
  }
]

const area_questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Name of area:'
  },
  {
    type: 'input',
    name: 'respawn',
    message: 'Number of minutes to respawn:',
    validate: value => {
      if (!value) { return false; }
      const valid = value.match(/^\d+/);
      if (valid) return true;
      return 'Please enter a number.';
    },
  },
  {
    type: 'confirm',
    name: 'instanced',
    message: 'Is this area instanced?',
    default: false,
  },
];

const list_areas = (store) => {
  return {
    type: 'rawlist',
    name: 'list_areas',
    message: 'Which area would you like to edit?',
    choices: [...store.areaNames, 'Back'],
  }
}

class App {
  static menu() {
    prompt(menu_prompt).then(answers => {
      if (answers.menu === 'quit') {
        console.log('Goodbye!');
        return;
      }
      this[answers.menu]();
    });
  }

  static create() {
    store.addArea();
    prompt(area_questions).then(answers => {
      store.configureArea(store.areas.length - 1, answers.name, answers.respawn, answers.instanced);
      this.menu();
    });
  }

  static edit() {
    const current_list = list_areas(store);
    prompt(current_list).then(answers => {
      const index = this.validateIndex(current_list, answers.list_areas);
      if (index || index === 0) {
        const default_area_questions = area_questions.map(question => {
          return {...question, default: store.areas[0][question.name]};
        });
        prompt(default_area_questions).then(answers => {
          store.configureArea(index, answers.name, answers.respawn, answers.instanced);
          this.menu();
        });
      }
    });
  }

  static save() {
    store.areas.forEach(area => {
      console.log(`${area.name}|${area.respawn}|${area.instanced}`);
    });
  }

  static save_all() {
    this.save();
  }

  static validateIndex(current_list, answer) {
    const index = current_list.choices.indexOf(answer);
    if (isNaN(index) || index < 0 || index >= store.areas.length) {
      if (index >= current_list.choices.length - 1) {
        this.menu(); // Goes back in menu since 'Back' is always appended to the back
        return;
      }
      console.error('ERROR: Area to add rooms to not found!');
      return;
    }

    return index;
  }

  static room_menu() {
    const current_list = list_areas(store);
    prompt(current_list).then(answers => {
      const index = this.validateIndex(current_list, answers.list_areas);
      if (index || index === 0) {
        prompt(room_questions).then(answers => {
          this[answers.room_questions]();
        });
      }
    });
  }

  static room_edit() {

  }

  static room_add() {
    store.addRoom(index, answers.name, answers.description, terrain, answers.coordinates);
  }

}

function main() {
  console.log('Welcome to the area wizard.');
  App.menu();
}

main();
