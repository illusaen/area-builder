'use strict';

import { action, computed, observable } from 'mobx';
import { calculateCoordinates, equalCoordinates, normalizeDirection } from '../utils';
import Room from '../models/room';
import areaStore from './area';

/**
 * Room store module used to store list of all rooms created as well as the currently selected room.
 * @module RoomStore
 */
class RoomStore {
  @observable selectedIndex = -1;
  @observable _rooms = [];
  
  /**
   * Gets list of rooms in selected area. Computed using mobx array of rooms and AreaStore's selected index.
   * @return {array<Room>} Array of rooms in selected area.
   */
  @computed get rooms() {
    return this._rooms.filter(room => room.areaIndex === areaStore.selectedIndex);
  }

  /**
   * Checks if selected room exists and is in selected area. Computed uses mobx array of rooms and selected index. Also uses AreaStore's selected index.
   * @return {boolean} If selected room exists.
   */
  @computed get hasSelectedRoom() {
    return this._rooms.length && 
      this.selectedIndex > -1 && 
      this.selectedIndex < this._rooms.length 
      && this._rooms[this.selectedIndex].areaIndex === areaStore.selectedIndex;
  }

  /**
   * Gets selected room. Computed using hasSelectedRoom and selectedIndex.
   * @return {Room} Selected room.
   */
  @computed get selected() {
    return this.hasSelectedRoom && this._rooms[this.selectedIndex];
  }

  /**
   * Gets room IDs. Computed using mobx array of rooms as well as the convenience function {@link createId}.
   * @return {array<String>} Array of IDs.
   */
  @computed get ids() {
    return this._rooms.map(room => room.id);
  }

  /**
   * Checks if there is a room in the direction of the currently selected room. Uses selected room as well as the convenience function {@link equalCoordinates} to check room equality.
   * @param {string} direction Direction to check. Must be normalized to (north|south|east|west|up|down) format.
   * @return {mobx.computed<boolean>} Mobx computed wrapper around whether room exists in given direction. Unwrap using .get().
   * @throws Will throw an error if there is no selected room.
   */
  exists(direction) {
    if (!this.hasSelectedRoom) {
      throw new ReferenceError('Selected room does not exist.');
    }

    return computed(() => {
      const coordinates = calculateCoordinates(this.selected.coordinates, direction);
      return coordinates && direction && this._rooms.filter(room => equalCoordinates(room.coordinates, coordinates)).length > 0;
    });
  }

  /**
   * Sets selected room by name. Uses convenience function {} to find area.
   * @param {string} id Id of room to select.
   * @throws Will throw an error if room couldn't be found.
   */
  @action select(id) {
    const index = this._rooms.findIndex(room => room.id === id);
    if (index === -1) {
      throw new TypeError('Room couldn\'t be found.');
    }

    this.selectedIndex = index;
  }

  /**
   * Adds a new room to the store in the direction of the currently selected room. Sets selected room to the newly created room.
   * @param {string} name Name of room that is the raw user inputted string.
   * @param {string} description Room description that is the raw user inputted string.
   * @param {string} terrain Terrain that has been validated.
   * @param {string} direction User inputted direction that the room being added is in relation to the selected room.
   * @throws Will throw an error if direction is invalid or there is already a room in that direction.
   */
  @action add(name, description, terrain, direction) {
    const dir = normalizeDirection(direction);
    if (!dir) {
      throw new TypeError('Invalid direction given.');
    }

    if (this.exists(dir).get()) {
      throw new TypeError('Room already exists in that direction.');
    }

    this._rooms.push(new Room(name, description, terrain, direction));
    this.selectedIndex = this._rooms.length - 1;
  };

  /**
   * Edits the currently selected room. Uses current index.
   * @param {string} name Name of the room to change to. Defaults to previous name. Raw user input string.
   * @param {string} description Description of the room to change to. Defaults to previous description. Raw user input string.
   * @param {string} terrain Terrain of the room to change to. Defaults to previous terrain. Already validated.
   * @throw Will throw an error if there is no selected room.
   */
  @action edit(name, description, terrain) {
    if (!this.hasSelectedRoom) {
      throw new ReferenceError('Selected room does not exist.');
    }

    this._rooms[this.selectedIndex].name = name;
    this._rooms[this.selectedIndex].description = description;
    this._rooms[this.selectedIndex].terrain = terrain;
  };

  /**
   * Deletes the currently selected room. Sets selected room to the first room in the currently selected area.
   * @throw Will throw an error if there is no selected room.
   */
  @action delete() {
    if (!this.hasSelectedRoom) {
      throw new ReferenceError('Selected room does not exist.');
    }
    
    this._rooms.splice(this.selectedIndex, 1);
    this.selectedIndex = this._rooms.findIndex(room => room.areaIndex === areaStore.selectedIndex);
  };

  /**
   * Deletes rooms in given area. Sets selected room to the first room of first area if there is at least one room else -1.
   * @param {number} areaIndex Index of area being deleted.
   */
  @action deleteRooms(areaIndex) {
    const rooms = this._rooms
      .filter(room => room.areaIndex !== areaIndex)
      .map(room => {
        // Area at areaIndex is being removed, so decrement all rooms' indices who belong to areas with indices above the one being deleted
        if (room.areaIndex > areaIndex) {
          const coords = { x: room.coordinates.x, y: room.coordinates.y, z: room.coordinates.z };
          return Room.from(room, room.areaIndex - 1, coords);
        }
        return room;
      });
    this._rooms = rooms;
    this.selectedIndex = this._rooms.length ? 0 : -1;
  }
}

export default RoomStore;
