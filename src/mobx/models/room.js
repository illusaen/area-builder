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
    return new Room(areaIndex, room.name, room.description, room.terrain, coordinates);
  }
  
  static parsed(areaIndex, data) {
    const terrain = data.metadata && data.metadata.terrain || '_default';
    const [ x, y, z ] = data.coordinates || [0, 0, 0];
    const room = new Room(areaIndex, data.title, data.description, terrain, new Coordinate(x, y, z));
    room.npcs = data.npcs || [];
    room.script = data.script || '';
    room.exits = data.exits || [];
    room.items = data.items || [];
    room.doors = data.doors;
    room.behaviors = data.behaviors;
    return room;
  }

  @observable name = '';
  @observable areaIndex = -1;
  @observable description = '';
  @observable terrain = '';
  @observable coordinates = new Coordinate(0, 0, 0);

  @observable npcs = [];
  @observable items = [];
  @observable exits = [];
  @observable doors;
  @observable script = '';
  @observable behaviors;

  @computed get id() {
    const tokenizedName = createId(this.name);
    const index = store.roomStore.with(tokenizedName, this.coordinates).get();
    return `${tokenizedName}-${index+1}`;
  }

  @computed get npcString() {
    if (!this.npcs.length) return '';

    let isPlainArray = true;
    const mapped = this.npcs.map(npc => {
      if (npc.id || npc.maxLoad || npc.respawnChance) {
        isPlainArray = false;
        return `    - id: "${npc.id}"\n` + (npc.respawnChance && `      respawnChance: ${npc.respawnChance}\n` || '') + (npc.maxLoad && `      maxLoad: ${npc.maxLoad}\n` || '');
      } else {
        return `"${npc}"`;
      }
    });
    
    return '\n  npcs:' + (isPlainArray ? ` [${mapped.join(', ')}]` : '\n' + mapped.join('\n'));
  }

  @computed get itemString() {
    if (!this.items.length) return '';

    return '\n  items:\n' + this.items.map(item => {
      return `    - id: "${item.id}"\n` + (item.respawnChance && `      respawnChance: ${item.respawnChance}\n` || '') + (item.replaceOnRespawn !== undefined && `      replaceOnRespawn: ${item.replaceOnRespawn}\n` || '');
    });
  }

  @computed get exitsString() {
    if (!this.exits.length) return '';

    return '\n  exits:\n' + this.exits.map(exit => {
      return `    - roomId: "${exit.roomId}"\n` + (exit.direction && `      direction: ${exit.direction}` || '');
    });
  }

  @computed get scriptString() {
    return this.script === '' ? '' : `script: "${this.script}"\n`;
  }

  @computed get behaviorString() {
    if (!this.behaviors) return '';
    return '\n  behaviors:\n' + (this.behaviors.waypoint === undefined ? '' : `    waypoint: ${this.behaviors.waypoint}`);
  }

  @computed get doorString() {
    if (!this.doors) return '';

    const [ key, value ] = Object.entries(this.doors)[0];
    return '\n  doors:\n' + `    "${key}":\n` +
           (value.lockedBy === undefined ? '' : `      lockedBy: "${value.lockedBy}"\n`) +
           (value.locked === undefined ? '' : `      locked: ${value.locked}\n`) +
           (value.closed === undefined ? '' : `      closed: ${value.closed}`);
  }

  /**
   * Returns representation of room in string format. String is formatted for RanvierMUD.
   * @return {string} String representation of room instance.
   */
  @computed get string() {
    return stripIndent`
- id: ${this.id}
  title: ${this.name}
  coordinates: [${this.coordinates.string()}]
  description: "${this.description.replace(/\n\s*\n/g, '\n\n\n')}"
  metadata:
    terrain: "${this.terrain}"` + this.behaviorString + this.scriptString + this.itemString + this.npcString + this.doorString + this.exitsString;
  }
}

export default Room;
