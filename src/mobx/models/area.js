'use strict';

import { computed, observable } from 'mobx';
import { stripIndent } from 'common-tags';
import { createId } from '../../lib/utils';

class Area {
  constructor(name, respawn, instanced) {
    this.name = name;
    this.respawn = respawn;
    this.instanced = instanced;
  }

  static parsed(data) {
    const respawn = data.behaviors['progressive-respawn'].interval || 0;
    const instanced = data.instanced !== undefined && data.instanced;
    return new Area(data.title, respawn, instanced);
  }

  @observable name = '';
  @observable respawn = 0;
  @observable instanced = false;

  @computed get id() {
    return createId(this.name);
  }

  /**
   * Returns representation of area in string format. String is formatted for RanvierMUD.
   * @return {string} String representation of area instance.
   */
  @computed get string() {
    return stripIndent`
      ---
      title: ${this.name}
      behaviors:
        progressive-respawn:
          interval: ${this.respawn}
    ` + (this.instanced ? '\ninstanced: player' : '') + '\n';
  }
}

export default Area;
