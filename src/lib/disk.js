'use strict';

import fs from 'fs';
import moment from 'moment';

const Name = {
  ROOM: 'rooms.yml',
  AREA: 'manifest.yml',
  FOLDER: './exports',
  TIMESTAMP: 'YYYY-MM-DD--HH-mm-ss',
}

class FSWriter {
  static saveArea(area, rooms, log) {
    const directory = this._createDirectory(area);
    this._writeFile(`${directory}/${Name.AREA}`, area.string, log);

    const roomData = rooms.map(rm => rm.string).join('\n\n') + '\n';
    this._writeFile(`${directory}/${Name.ROOM}`, roomData, log);
  }

  static _createDirectory(area) {
    if (!fs.existsSync(Name.FOLDER)) {
      fs.mkdirSync(Name.FOLDER);
    };

    const areaDirectory = `${Name.FOLDER}/${area.id}-${moment().format(Name.TIMESTAMP)}`;
    fs.mkdirSync(areaDirectory);
    return areaDirectory;
  }

  static _writeFile(path, data, log) {
    fs.writeFile(path, data, { flag: 'w' }, error => {
      if (error) { throw error; }
      if (log) {
        console.log(`${path} written.`);
      }
    });
  }
}

export default FSWriter;
