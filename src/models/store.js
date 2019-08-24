'use strict';

import { computed, observable, action } from 'mobx';
import { Area, Room } from './area';

class Store {
  @observable areas = [];
  @observable rooms = [];

  @observable selectedArea = 0;
  @observable selectedRoom = 0;
  
  @observable map = false;

  @computed get areaNames() {
    return this.areas.map(area => area.name);
  }

  addArea = action( () => this.areas.push(new Area()) );
  configureArea = action( (name, respawn, instanced) => {
    this.areas[this.selectedArea].name = name;
    this.areas[this.selectedArea].respawn = respawn;
    this.areas[this.selectedArea].instanced = instanced;
  });

  addRoom = action( (name, description, coordinates) => this.rooms.push(new Room(this.selectedArea, name, description, coordinates)) );
}

const store = new Store();
export default store;
