'use strict';

import { observable } from 'mobx';

//////// ROOM NEEDS TO BE ABLE TO BE MOVED
//////// SHOULD SHOW MAP AS MESSAGE IF MAP TRUE
//////// ADD DOOR FUNCTIONALITY

/**
 * Root store holding configuration options as well as references to {@link AreaStore} and {@link RoomStore}. Only access either via this root store.
 * @module RootStore
 */
class RootStore {
  @observable map = false;
  @observable areaStore;
  @observable roomStore;

  constructor(areaStore, roomStore) {
    this.areaStore = areaStore;
    this.roomStore = roomStore;
  }
}

const rootStore = new RootStore();
export default rootStore;
