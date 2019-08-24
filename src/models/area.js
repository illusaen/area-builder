'use strict';

import { computed, observable } from 'mobx';
import { createId } from '../utils';

class Area {
  constructor(name, respawn, instanced) {
    this.name = name;
    this.respawn = respawn;
    this.instanced = instanced;
  }

  @observable name = '';
  @observable respawn = 0;
  @observable instanced = false;

  @computed get id() {
    return createId(this.name);
  }
}

export default Area;
