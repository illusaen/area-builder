'use strict';

import { toEnum } from '../../utils';

const _deltas = {
  east  : { x:  1, y:  0, z:  0 },
  west  : { x: -1, y:  0, z:  0 },
  north : { x:  0, y:  1, z:  0 },
  south : { x:  0, y: -1, z:  0 },
  up    : { x:  0, y:  0, z:  1 },
  down  : { x:  0, y:  0, z: -1 },
};
class Coordinate {
  constructor(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  static from(previousCoordinates, direction) {
    if (!previousCoordinates) {
      throw new TypeError('Could not calculate coordinates because origin room coordinates not found.');
    }
    
    const delta = _deltas[direction];
    if (!delta) {
      throw new TypeError('Could not calculate coordinates because delta for direction not found.');
    }

    return new Coordinate(previousCoordinates._x + delta.x, previousCoordinates._y + delta.y, previousCoordinates._z + delta.z);
  }

  static copy(previousCoordinates) {
    return new Coordinate(previousCoordinates._x, previousCoordinates._y, previousCoordinates._z);
  }

  equal(rhs) {
    return this._x === rhs._x && this._y === rhs._y && this._z === rhs._z;
  }

  string() {
    return `${this._x}, ${this._y}, ${this._z}`;
  }
}

const Directions = new toEnum({
  EAST  : 'east',
  WEST  : 'west',
  NORTH : 'north',
  SOUTH : 'south',
  UP    : 'up',
  DOWN  : 'down'
}, (input, obj) => {
  return input && obj._keys.filter(key => obj[key].indexOf(input) === 0)[0];
});

export { Coordinate, Directions };
