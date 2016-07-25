var ObjectId = require('mongoose').Types.ObjectId;

var errors = {
    MissingProperty: function(obj, propText, propValue) {
        this.stack = (new Error()).stack;
        var name = obj.constructor.modelName;
        this.message = 'This ' + name + 
                       ' does not have a ' + propText +
                       ' set.';
        var value = propValue === false ? undefined :
            propValue || obj[propText];
        this.missingProperty = value;
    },

    NotFound: function(collection, search) {
        this.stack = new Error().stack;
        
        if (typeof search === 'string')
            search = { id: search }        
        else if (search instanceof ObjectId)
            search = { _id: search }

        this.message = 'Could not find ' + collection + ': ' +
            JSON.stringify(search);
        this.search = search;
        this.collection = collection;
    },

    BadInput: function(props, operation, input) {
        this.stack = new Error().stack;
        var message = "Could not " + (operation || "complete operation") + " as valid ";
        if (props instanceof Array)
            message += props.toString() + " were not provided.";
        else
            message += props + " was not privded.";
        this.message = message;
        this.input = input;
    }
}

for (var error in errors) {
    errors[error].prototype = Object.create(Error.prototype);
    errors[error].prototype.constructor = errors[error];
    errors[error].prototype.name = error;
}

module.exports = errors;