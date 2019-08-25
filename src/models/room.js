'use strict';

import { computed, observable } from 'mobx';
import store from '../store';
import { createId } from '../utils';

class Room {
  constructor(areaIndex, name, description, terrain, coordinates) {
    this.areaIndex = areaIndex;
    this.name = name;
    this.description = description;
    this.terrain = terrain;
    this.coordinates = coordinates;
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
    const tokenizedName = createId(this.name);
    const index = store.roomStore.with(tokenizedName, this.coordinates).get();
    return `${tokenizedName}-${index+1}`;
  }

  @computed get coordinateString() {
    return `${this.coordinates.x}, ${this.coordinates.y}, ${this.coordinates.z}`;
  }
}

export default Room;
