'use strict';

import { computed, observable } from 'mobx';
import { stripIndent } from 'common-tags';
import { createId } from '../../lib/utils';
import { Coordinate } from './coordinate';
import store from '../store';

class Room {
  constructor(areaIndex, name, description, terrain, coordinates) {
    this.areaIndex = areaIndex;
    this.name = name;
    this.description = description;
    this.terrain = terrain;
    this.coordinates = coordinates;
  }

  static from(room, areaIndex, coordinates) {
    const newRoom = new Room(areaIndex, room.name, room.description, room.terrain, coordinates);
    return newRoom;
  }
  
  static parsed(areaIndex, data) {
    const terrain = data.metadata.terrain;
    const [ x, y, z ] = data.coordinates;
    return new Room(areaIndex, data.title, data.description, terrain, new Coordinate(x, y, z));
  }

  @observable name = '';
  @observable areaIndex = -1;
  @observable description = '';
  @observable terrain = '';
  @observable coordinates = new Coordinate(0, 0, 0);

  @computed get id() {
    const tokenizedName = createId(this.name);
    const index = store.roomStore.with(tokenizedName, this.coordinates).get();
    return `${tokenizedName}-${index+1}`;
  }

  /**
   * Returns representation of room in string format. String is formatted for RanvierMUD.
   * @return {string} String representation of room instance.
   */
  @computed get string() {
    return stripIndent`
- id: ${this.id}
  title: "${this.name}"
  coordinates: [${this.coordinates.string()}]
  description: "${this.description}"
  metadata:
    terrain: "${this.terrain}"`;
  }
}

export default Room;
