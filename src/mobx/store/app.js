'use strict';

import { computed, observable } from 'mobx';
import AreaStore from './area';
import RoomStore from './room';

//////// ROOM NEEDS TO BE ABLE TO BE MOVED
//////// SHOULD SHOW MAP AS MESSAGE IF MAP TRUE
//////// ADD DOOR FUNCTIONALITY

/**
 * Root store holding configuration options as well as owning references to {@link AreaStore} and {@link RoomStore}. Only access either via this root store.
 * @module RootStore
 */
class RootStore {
  @observable map = false;

  /**
   * Constructs a new RootStore. Also creates children stores {@link AreaStore} and {@link RoomStore} and seeds them with a reference to itself.
   */
  constructor() {
    this.areaStore = new AreaStore(this);
    this.roomStore = new RoomStore(this);
  }

  /**
   * Filters choice list depending on state.
   * @param {boolean} isArea Boolean used to dispatch the filter to either the {@link AreaStore} or the {@link RoomStore}.
   * @param {array<Object>} choices Prompt list that requires includes a 'needs' variable reprsenting what the choice needs to be shown.
   * @return {array<Object>} Filtered list of choices.
   */
  filter(isArea, choices) {
    const ref = isArea ? this.areaStore : this.roomStore;
    return choices
      .filter(choice => !choice.needs || ref[choice.needs])
      .map(choice => ({ name: choice.name, value: choice.value}));
  };
}

export default RootStore;
