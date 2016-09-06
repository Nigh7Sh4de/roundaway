var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var carSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    license: String,
    make: String,
    model: String,
    year: Number,
    colour: String,
    description: String
})

carSchema.methods.getLicense = function() {
    return this.license || "";
}

carSchema.methods.setLicense = function(license) {
    return new Promise(function(resolve, reject) {
        if (license == null || typeof license !== 'string')
            return reject('Cannot set license as the provided license is invalid');
        this.license = license;
        this.save(function(err, car) {
            if (err) return reject(err);
            resolve(car);
        })
    })
}

carSchema.methods.getMake = function() {
    return this.make || "";
}

carSchema.methods.setMake = function(make) {
    return new Promise(function(resolve, reject) {
        if (make == null || typeof make !== 'string')
            return reject('Cannot set make as the provided make is invalid');
        this.make = make;
        this.save(function(err, car) {
            if (err) return reject(err);
            resolve(car);
        })
    })
}

carSchema.methods.getModel = function() {
    return this.model || "";
}

carSchema.methods.setModel = function(model) {
    return new Promise(function(resolve, reject) {
        if (model == null || typeof model !== 'string')
            return reject('Cannot set model as the provided model is invalid');
        this.model = model;
        this.save(function(err, car) {
            if (err) return reject(err);
            resolve(car);
        })
    })
}

carSchema.methods.getYear = function() {
    return this.year || 0;
}

carSchema.methods.setYear = function(year) {
    return new Promise(function(resolve, reject) {
        year = parseInt(year);
        if (year == null || isNaN(year))
            return reject('Cannot set year as the provided year is invalid');
        this.year = year;
        this.save(function(err, car) {
            if (err) return reject(err);
            resolve(car);
        })
    })
}

carSchema.methods.getColour = function() {
    return this.colour || "";
}

carSchema.methods.setColour = function(colour) {
    return new Promise(function(resolve, reject) {
        if (colour == null || typeof colour !== 'string')
            return reject('Cannot set colour as the provided colour is invalid');
        this.colour = colour;
        this.save(function(err, car) {
            if (err) return reject(err);
            resolve(car);
        })
    })
}

carSchema.methods.getDescription = function() {
    return this.description || "";
}

carSchema.methods.setDescription = function(description) {
    return new Promise(function(resolve, reject) {
        if (description == null || typeof description !== 'string')
            return reject('Cannot set description as the provided description is invalid');
        this.description = description;
        this.save(function(err, car) {
            if (err) return reject(err);
            resolve(car);
        })
    })
}

var Car = mongoose.model('Car', carSchema);

module.exports = Car;