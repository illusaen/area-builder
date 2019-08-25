'use strict';

import { action, computed, observable } from 'mobx';
import Area from './area';
import Room from './room';
import { calculateCoordinates, equalCoordinates, equalNames } from '../utils';

class Store {
  @observable areas = [];
  @observable rooms = [];

  @observable selectedAreaIndex = -1;
  @observable selectedRoomIndex = -1;
  
  @observable map = false;

  @action setSelectedArea(index) {
    this.selectedAreaIndex = index;
  }

  @action setSelectedRoom(index) {
    this.selectedRoomIndex = index;
  }

  @computed get numberOfAreas() {
    return this.areas.length;
  }

  @computed get roomsInArea() {
    return this.rooms.filter(room => room.areaIndex === this.selectedAreaIndex);
  }

  @computed get hasSelectedArea() {
    return this.areas.length && this.selectedAreaIndex > -1;
  }

  @computed get selectedArea() {
    return this.areas[this.selectedAreaIndex];
  }

  doesAreaExist = name => {
    return this.areas.filter(area => equalNames(area.name, name)).length > 0;
  }

  @computed get areaNames() {
    return this.areas.map(area => area.name);
  }

  @computed get hasSelectedRoom() {
    return this.roomsInArea.length && this.selectedRoomIndex > -1 && this.rooms[this.selectedRoomIndex].areaIndex === this.selectedAreaIndex;
  }

  @computed get selectedRoom() {
    return this.rooms[this.selectedRoomIndex];
  }

  doesRoomExist = (room, direction) => {
    const coordinates = calculateCoordinates(room.coordinates, direction);
    if (!coordinates || !direction) { return false; }
    return this.roomsInArea.filter(rm => equalCoordinates(rm.coordinates, coordinates)).length > 0;
  }

  @computed get idOfRoomsInArea() {
    return this.roomsInArea.map(room => room.id);
  }

  @action addArea(name, respawn, instanced) {
    this.areas.push(new Area(name, respawn, instanced));
    this.selectedAreaIndex = this.areas.length - 1;
  }

  @action configureArea(name, respawn, instanced) {
    this.areas[this.selectedAreaIndex].name = name;
    this.areas[this.selectedAreaIndex].respawn = respawn;
    this.areas[this.selectedAreaIndex].instanced = instanced;
  }

  @action deleteArea() {
    const rooms = this.rooms.filter(room => room.areaIndex !== this.selectedAreaIndex)
      .map(room => {
        if (room.areaIndex > this.selectedAreaIndex) {
          const coords = { x: room.coordinates.x, y: room.coordinates.y, z: room.coordinates.z };
          return Room.from(room, room.areaIndex - 1, coords);
        }
        return room;
      }); 
    this.rooms = rooms;
    this.areas.splice(this.selectedAreaIndex, 1);
    this.setSelectedArea(store.areas.length - 1);
    this.setSelectedRoom(store.roomsInArea.length - 1);
  }

  @action addRoom(name, description, terrain, direction) {
    this.rooms.push(new Room(name, description, terrain, direction));
    this.selectedRoomIndex = this.rooms.length - 1;
  };

  @action configureRoom(name, description, terrain) {
    this.rooms[this.selectedRoomIndex].name = name;
    this.rooms[this.selectedRoomIndex].description = description;
    this.rooms[this.selectedRoomIndex].terrain = terrain;
  };

  @action deleteRoom() {
    this.rooms.splice(this.selectedRoomIndex, 1);
    this.selectedRoomIndex = this.rooms.findIndex(room => room.areaIndex === this.selectedAreaIndex);
  };
}

const store = new Store();

export default store;
