'use strict';

import store from './store/app';

const filterChoices = (choices) => {
  return choices
  .filter(choice => !choice.needs || (store[choice.needs]))
  .map(choice => {
    return { name: choice.name, value: choice.value}
  });
}

const createId = name => {
  return name.toLowerCase().replace(/(the |an |a )/g, '').trim().replace(/\s+/g, '-');
};

const directions = ['north', 'south', 'west', 'east', 'up', 'down'];
const normalizeDirection = (direction) => directions.filter(dir => dir.indexOf(direction) === 0)[0];

const deltas = {
  north : { x:  0, y:  1, z:  0 },
  south : { x:  0, y: -1, z:  0 },
  east  : { x:  1, y:  0, z:  0 },
  west  : { x: -1, y:  0, z:  0 },
  up    : { x:  0, y:  0, z:  1 },
  down  : { x:  0, y:  0, z: -1 },
}
const calculateCoordinates = (previous_coordinates, direction) => {
  if (!previous_coordinates) {
    console.error('ERROR: Could not find coordinates of selected room.');
    process.exit(1);
  }
  
  const delta = deltas[direction];
  if (!delta) {
    console.error('ERROR: Could not find delta for direction.');
    process.exit(1);
  }

  return {
    x: previous_coordinates.x + delta.x,
    y: previous_coordinates.y + delta.y,
    z: previous_coordinates.z + delta.z,
  };
}

const equalCoordinates = (lhs, rhs) => lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z;

const equalNames = (lhs, rhs) => createId(lhs) === createId(rhs);

const contains = (list, answer) => list.filter(el => el === answer).length > 0;

export { createId, calculateCoordinates, contains, equalCoordinates, equalNames, filterChoices, normalizeDirection };
