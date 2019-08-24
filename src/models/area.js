'use strict';

import { computed, observable, action } from 'mobx';
import store from './store';

const createId = name => {
  return name.replace('/ /g', '_').toLowerCase();
}

class Area {
  @observable name = '';
  @observable respawn = 0;
  @observable instanced = false;

  @computed get id() {
    return createId(this.name);
  }
}

class Room {
  constructor(areaId, name, description, terrain, coordinates) {
    this.areaId = areaId;
    this.name = name;
    this.description = description;
    this.terrain = terrain;
    this.coordinates = coordinates;
  }

  @observable name = '';
  @observable areaId = '';
  @observable description = '';
  @observable terrain = '';
  @observable coordinates = { x: 0, y: 0, z: 0 };

  @computed get id() {
    const otherRoom = store.rooms.find(room => room.id.indexOf(createId(this.name)) === 0);
    let number = 1;
    if (otherRoom) {
      const tokens = otherRoom.name.split('-');
      number = tokens[tokens.length - 1] + 1;
    }
    return tokens.slice(0, tokens.length-1).join('-') + `-${number.toString()}`;
  }
}

export { Area, Room };
