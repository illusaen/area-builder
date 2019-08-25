'use strict';

import { computed, observable } from 'mobx';
import store from '../store/app';
import { createId, calculateCoordinates, equalCoordinates } from '../utils';

class Room {
  constructor(name, description, terrain, direction) {
    this.areaIndex = store.selectedAreaIndex;
    this.name = name;
    this.description = description;
    this.terrain = terrain;

    if (direction) {
      this.coordinates = calculateCoordinates(store.selectedRoom.coordinates, direction);
    }
  }

  static from(room, areaIndex, coordinates) {
    const newRoom = new Room(room.name, room.description, room.terrain);
    newRoom.coordinates = { x: coordinates.x, y: coordinates.y, z: coordinates.z };
    newRoom.areaIndex = areaIndex;
    return newRoom;
  }

  @observable name = '';
  @observable areaIndex = -1;
  @observable description = '';
  @observable terrain = '';
  @observable coordinates = { x: 0, y: 0, z: 0 };

  @computed get id() {
    const tokenized = createId(this.name);
    const roomsWithName = store.rooms.filter(room => createId(room.name) === tokenized);
    const index = roomsWithName.findIndex(room => equalCoordinates(this.coordinates, room.coordinates));
    return tokenized + '-' + (index+1).toString();
  }

  @computed get coordinateString() {
    return `${this.coordinates.x}, ${this.coordinates.y}, ${this.coordinates.z}`;
  }
}

export default Room;
