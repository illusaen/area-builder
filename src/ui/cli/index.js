import { toEnum } from '../../lib/utils';

const pageSize = 24;

const AreaPrompts = new toEnum({
  CREATE: 'create_area',
  DELETE: 'delete_area',
  EDIT: 'edit_area',
  LOAD: 'load_area',
  LOAD_ALL: 'load_all',
  MENU: 'menu_area',
  SAVE: 'save_area',
  SAVE_ALL: 'save_all',
  SELECT: 'select_area',
  QUIT: 'quit',
  BACK: 'Back',
}, undefined);

const RoomPrompts = new toEnum({
  CREATE: 'create_room',
  DELETE: 'delete_room',
  EDIT: 'edit_room',
  MENU: 'menu_room',
  SELECT: 'select_room',
  BACK: 'Back',
}, undefined);

export { AreaPrompts, pageSize, RoomPrompts };
