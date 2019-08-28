'use strict';

/**
 * Transforms user inputed name into an identifier without a number indicating its duplicates.
 * @param {string} name Raw user inputed name.
 * @return {string} Name transformed into an identifier by removing articles and replacing all spaces with hyphens.
 */
function createId(name) {
  return name.toLowerCase().replace(/(the |an |a )/g, '').trim().replace(/\s+/g, '-');
}

/**
 * Checks if two names collide by comparing the two hashes.
 * @param {string} lhs Left hand side name.
 * @param {string} rhs Right hand side name.
 * @return {boolean} True if the two are equal, false if not.
 */
function equalNames(lhs, rhs) {
  return createId(lhs) === createId(rhs);
}

/**
 * Checks if an element is in the array. The element type must also match the array's element type exactly.
 * @param {array} list Array of elements to check.
 * @param {*} element Element to check array against.
 * @return {boolean} True if element is represented in the array, false if not.
 */
function contains(list, element) {
  return list.filter(el => el === element).length > 0;
}

/**
 * Composer class used to create enumerations. Will have convenience functions:
 * Takes in an {@link Object} object with key/value pairs representing enumeration element and representation of element.
 * Will have convenicne functions:
 * {@link this#normalize} normalize Normalizes input value into element of the enumeration.
 * {@link this#has} has Checks if enumeration contains element.
 * 
 * @example 
 * const Enum = toEnum({ a: 1, b: 2 });
 * Enum.a === 1; // true
 */
class toEnum {
  constructor(object, fn) {
    Object.keys(object).forEach(key => this[key] = object[key]);
    this._keys = Object.keys(object);
    this.normalize = function(input) {
      return object[fn(input, this)];
    };
    return Object.freeze(this);
  }

  values() {
    return this._keys.map(el => this[el]);
  }
  
  has(key) {
    return this.values().includes(key) || this._keys.includes(key);
  }
}

export { createId, contains, equalNames, toEnum };
