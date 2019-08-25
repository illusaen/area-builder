'use strict';

import { observable } from 'mobx';
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
   * Dispatches call to correct child store.
   * @param {boolean} isArea Which child to dispatch to.
   * @return {mobx.computed<AreaStore|RoomStore>} Mobx computed wrapper around a reference to {@link AreaStore} if isArea else {@link RoomStore}. Unwrap using .get().
   */
  dispatcher(isArea) {
    return computed(() => isArea ? this.areaStore : this.roomStore);
  }
}

export default RootStore;
