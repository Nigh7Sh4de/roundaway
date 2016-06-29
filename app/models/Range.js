var ranger = require('rangerjs');
var Schema = require('mongoose').Schema;

module.exports = function(type) {
    return {
        type: [new Schema(ranger.Range(type), {_id: false, id: false})],
        get: function(data) {
            try {
                return new ranger(data);
            } catch(e) {
                console.error(e);
                return data;
            }
        },
        set: function(data) {
            return data.ranges || data;
        }
    }
}