var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var spotSchema = new Schema({
    address: String,
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    }
});

var Spot = mongoose.model('Spot', spotSchema);

module.exports = Spot;
