'use strict';

import { action, computed, observable } from 'mobx';
import { createId } from '../../utils';
import Room from '../models/room';
import { Coordinate, Directions } from '../models/coordinate';

/**
 * Room store module used to store list of all rooms created as well as the currently selected room.
 * @module RoomStore
 */
class RoomStore {
  @observable selectedIndex = -1;
  @observable _rooms = [];
  
  /**
   * Constructs a new RoomStore with a reference to its parent {@link RootStore}.
   * @param {RootStore} rootStore Reference to rootStore. Only used to access sibling store {@link AreaStore}'s selectedIndex via computed property {@link this#selectedAreaIndex}.'
   */
  constructor(rootStore) {
    this._rootStore = rootStore;
  }

  /**
   * Gets selected area index from {@link AreaStore} via parent {@link RootStore}. Computed property.
   * @return {number} Index of selected area.
   */
  @computed get selectedAreaIndex() {
    return this._rootStore.areaStore.selectedIndex;
  }

  /**
   * Gets list of rooms in selected area. Computed using mobx array of rooms and AreaStore's selected index.
   * @return {array<Room>} Array of rooms in selected area.
   */
  @computed get rooms() {
    return this._rooms.filter(room => room.areaIndex === this.selectedAreaIndex);
  }

  /**
   * Checks if selected room exists and is in selected area. Computed uses mobx array of rooms and selected index. Also uses AreaStore's selected index.
   * @return {boolean} If selected room exists.
   */
  @computed get hasSelectedRoom() {
    return this._rooms.length && 
      this.selectedIndex > -1 && 
      this.selectedIndex < this._rooms.length 
      && this._rooms[this.selectedIndex].areaIndex === this.selectedAreaIndex;
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
   * Checks if there is a room in the direction of the currently selected room. Uses selected room to get coordinates.
   * @param {string} direction Direction to check. Must be normalized to (north|south|east|west|up|down) format.
   * @return {mobx.computed<boolean>} Mobx computed wrapper around whether room exists in given direction. Unwrap using .get().
   * @throws Will throw an error if there is no selected room.
   */
  exists(direction) {
    if (!this.hasSelectedRoom) {
      throw new ReferenceError('Selected room does not exist.');
    }

    return computed(() => {
      const coordinates = Coordinate.from(this.selected.coordinates, direction);
      return coordinates && direction && this._rooms.filter(room => room.coordinates.equal(coordinates)).length > 0;
    });
  }

  /**
   * Gets index of room with given ID and coordinates in order to get its position against other rooms in the selected area. Uses selected area as well as the convenience functions {@link createId}.
   * @param {string} id Base ID (without number hash) to check against the rooms.
   * @param {Coordinate} coordinates Coordinates to check against the rooms.
   * @return {mobx.computed<number>} Mobx computed wrapper around the index of the room with given ID and coordinates. Unwrap using .get().
   * @throws Will throw an error if there is no selected area.
   */
  with(id, coordinates) {
    return computed(() => this.rooms
        .filter(room => id === createId(room.name))
        .findIndex(room => coordinates.equal(room.coordinates)));
  }

  /**
   * Gets array of rooms belonging to area at index.
   * @param {number} index Index of areas to get rooms for.
   * @return {mobx.computed<array>} Mobx computed wrapper around an array of rooms belonging to area at index. Unwrap using .get().
   */
  inArea(index) {
    return computed(() => this._rooms.filter(room => room.areaIndex === index));
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
   * @param {string} name Name of room that is the raw user inputed string.
   * @param {string} description Room description that is the raw user inputed string.
   * @param {string} terrain Terrain that has been validated.
   * @param {string} direction User inputed direction that the room being added is in relation to the selected room. Can be undefined if this is the starting room.
   * @throws Will throw an error if direction is invalid or there is already a room in that direction.
   */
  @action add(name, description, terrain, direction) {
    let coordinates = new Coordinate(0, 0, 0);
    if (direction !== undefined) {
      const dir = Directions.normalize(direction);
      if (!dir) {
        throw new TypeError('Invalid direction given.');
      }

      if (this.exists(dir).get()) {
        throw new TypeError('Room already exists in that direction.');
      }

      coordinates = Coordinate.from(this.selected.coordinates, dir);
    }
    
    this._rooms.push(new Room(this.selectedAreaIndex, name, description, terrain, coordinates));
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
    this.selectedIndex = this._rooms.findIndex(room => room.areaIndex === this.selectedAreaIndex);
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
          return Room.from(room, room.areaIndex - 1, Coordinate.copy(room.coordinates));
        }
        return room;
      });
    this._rooms = rooms;
    this.selectedIndex = this._rooms.length ? 0 : -1;
  }
}

export default RoomStore;
