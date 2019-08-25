'use strict';

import { action, computed, observable } from 'mobx';
import Area from '../models/area';
import { equalNames } from '../utils';

/**
 * Area store module used to store list of all areas created as well as the currently selected area.
 * @module AreaStore
 */
class AreaStore {
  /**
   * Constructs a new AreaStore with a reference to its parent {@link RootStore}.
   * @param {RootStore} rootStore Reference to rootStore. Only used to access sibling store {@link RoomStore} when deleting an area so that the deleted area's rooms can also be deleted.
   */
  constructor(rootStore) {
    this._rootStore = rootStore;
  }

  @observable selectedIndex = -1;
  @observable _areas = [];

  /**
   * Gets total number of areas. Computed using mobx array of areas.
   * @return {number} Number of areas.
   */
  @computed get numberOfAreas() {
    return this._areas.length;
  }

  /**
   * Checks if selected area exists. Computed uses mobx array of areas and selected index.
   * @return {boolean} If selected area exists.
   */
  @computed get hasSelectedArea() {
    return this._areas.length && 
      this.selectedIndex > -1 &&
      this.selectedIndex < this._areas.length;
  }

  /**
   * Gets selected area. Computed using hasSelectedArea and selectedIndex.
   * @return {Area} Selected area.
   */
  @computed get selected() {
    return this.hasSelectedArea && this._areas[this.selectedIndex];
  }

  /**
   * Gets area by given index.
   * @param {number} index Index of area to get.
   * @return {Area} Area at given index.
   */
  @computed get area(index) {
    return this._areas[index];
  }
  
  /**
   * Gets area names. Computed using mobx array of areas..
   * @return {array<String>} Array of IDs.
   */
  @computed get names() {
    return this._areas.map(area => area.name);
  }

  /**
   * Checks if there is already an area by the given name. Uses convenience function {@link equalNames} to check if areas are the same.
   * @param {string} name Name of area to check. Raw user input.
   * @return {mobx.computed<boolean>} Mobx computed wrapper around whether area exists. Unwrap using .get().
   */
  exists(name) {
    return computed(() => this._areas.filter(area => equalNames(area.name, name)).length > 0);
  }

  /**
   * Sets selected area by name. Uses convenience function {@link equalNames} to find area.
   * @param {string} name Name of area to select.
   * @throws Will throw an error if area couldn't be found.
   */
  @action select(name) {
    const index = this._areas.findIndex(area => equalNames(area.name, name));
    if (index === -1) {
      throw new TypeError('Area couldn\'t be found.');
    }

    this.selectedIndex = index;
  }

  /**
   * Adds a new area to the store. Sets selected room to the newly created area.
   * @param {string} name Name of the area to add.
   * @param {number} respawn Respawn rate for the area to add.
   * @param {boolean} instanced Whether the area is instanced.
   * @throws Will throw an error if area with given name already exists.
   */
  @action add(name, respawn, instanced) {
    if (this.exists(name).get()) {
      throw new TypeError('Area already exists with that name.');
    }
    this._areas.push(new Area(name, respawn, instanced));
    this.selectedIndex = this._areas.length - 1;
  }

  /**
   * Edits the currently selected area. Uses current index.
   * @param {string} name Name of the area to change to. Defaults to previous name. Raw user input string.
   * @param {number} respawn Respawn rate of the area to change to. Defaults to previous respawn.
   * @param {boolean} instanced Whether the area is instanced. Defaults to previous setting.
   * @throws Will throw an error if there is no selected area.
   */
  @action edit(name, respawn, instanced) {
    if (!this.hasSelectedArea) {
      throw new ReferenceError('Selected area does not exist.');
    }

    this._areas[this.selectedIndex].name = name;
    this._areas[this.selectedIndex].respawn = respawn;
    this._areas[this.selectedIndex].instanced = instanced;
  }

  /**
   * Deletes the currently selected area. Also deletes the rooms connected to the selected area. Sets selected area to first area in array if there is at least one area else -1. Sets selected room to the first room in the newly selected area.
   * @throw Will throw an error if there is no selected area.
   */
  @action delete() {
    if (!this.hasSelectedArea) {
      throw new ReferenceError('Selected area does not exist.');
    }

    this._areas.splice(this.selectedIndex, 1);
    this._rootStore.roomStore.deleteRooms(this.selectedIndex);
    this.selectedIndex = this._areas.length ? 0 : -1;
  }
}

export default AreaStore;
