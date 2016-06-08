var sinon = require('sinon');
var helper = require('./helper');

var exts = {
    init: function(express) {
        express.response.sendGood = this.sendGood;
        express.response.sendBad = this.sendBad;
    },

    sendGood: function(msg, obj, opt) {
        opt = opt || {};
        return this.status(opt.code || 200).
                send(Object.assign({
                    status: opt.status || 'SUCCESS',
                    message: msg || 'Operation successful'
                }, obj));
    },

    sendBad: function(errs, obj, opt) {
        opt = opt || {};
        return this.status(opt.status || 500)
                .send(Object.assign({
                    status: opt.status || 'ERROR',
                    errors: errs instanceof Array ?
                        errs : [errs]
                }, obj));
    },

    mockResponse: function() {
        return {
            sent: function() {

            },
            sentWith: function(obj) {
                for (var prop in obj) { 
                    if (!this.send.firstCall.args[0][prop] ||
                        !helper.deepCompare(this.send.firstCall.args[0][prop], obj[prop]))
                        return false;
                }
                return true;
            },
            status: sinon.spy(function(s) {
                return this;
            }),
            send: sinon.spy(function() {
                this.sent()
            }),
            sendStatus: sinon.spy(),
            sendGood: sinon.spy(this.sendGood),
            sendBad: sinon.spy(this.sendBad)
        }
    },

    mockRequest: function() {
        return {
            body: {},
            query: {},
            params: {
                id: 'user.id'
            }
        }
    }
}

module.exports = exts;