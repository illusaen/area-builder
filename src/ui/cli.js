'use strict';

import { QuestionTypes } from "../prompts/data";

class CLI {
    static parsed(data) {
        const parsedData = {
            areaMenu: _parseAreaMenu(data.menu_area),
        };
        return parsedData;
    }

    static _parseAreaMenu(data) {
        return {
            type: this._question(data.type),
            name: 'menu_area',
            message: store.filter(data.header),
            choices: []
        };
    }

    static _question(questionType) {
        switch (questionType) {
            case QuestionTypes.CHOICE: return 'rawlist';
            case QuestionTypes.CHECKBOX: return 'confirm';
            case QuestionTypes.EDITOR: return 'editor';
            default: return 'input';
        }
    }
}

export default CLI;


return function(text) {
    text.replace(/${(.+?)}/g, match => { return store.replace(match).get()});
}