'use strict';

import { computed, observable } from 'mobx';
import { stripIndent } from 'common-tags';
import { createId } from '../../utils';

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

  /**
   * Returns representation of area in string format. String is formatted for RanvierMUD.
   * @return {string} String representation of area instance.
   */
  @computed get string() {
    return stripIndent`
      title: "${this.name}"
      behaviors:
        progressive-respawn:
          interval: ${this.respawn}
    ` + (this.instanced ? '\ninstanced: player' : '') + '\n';
  }
}

export default Area;
