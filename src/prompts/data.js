import { toEnum } from "../lib/utils";

const QuestionTypes = new toEnum({
   CHOICE: 'choice',
   FORM: 'form',
   INPUT: 'input',
   CHECKBOX: 'checkbox'
}, undefined);

const Terrains = new toEnum({
   CITY: 'city',
   FIELD: 'field',
   HILLS: 'hills',
   DESERT: 'desert',
   SWAMP: 'swamp',
   ICE: 'ice',
   LIGHT_FOREST: 'light_forest',
   DEEP_FOREST: 'deep_forest',
   JUNGLE: 'jungle',
   MOUNTAIN: 'mountain',
   WATER: 'water',
   DEEP_WATER: 'deep_water',
   UNDER_WATER: 'under_water',
   UNDER_GROUND: 'under_ground',
   AIR: 'air',
   LAVA: 'lava',
   DEFAULT: '_default'
}, undefined);

function validator(fn) {
   return function (value) {
      if (!value.toString().length) {
         return 'Please enter a value.';
      }
      return fn ? fn(value) : true;
   };
}

export { Terrains, QuestionTypes, validator };
