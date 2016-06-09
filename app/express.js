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
                send({
                    status: opt.status || 'SUCCESS',
                    message: msg || 'Operation successful',
                    errors: opt.errors || [],
                    data: obj
                });
    },

    sendBad: function(errs, obj, opt) {
        opt = opt || {};
        return this.status(opt.status || 500)
                .send({
                    status: opt.status || 'ERROR',
                    errors: errs instanceof Array ?
                        errs : [errs],
                    data: obj
                });
    },

    mockResponse: function() {
        return {
            sent: function() {

            },
            sentWith: function(obj, onBody) {
                var body = this.send.firstCall.args[0];
                if (onBody) {
                    if (!body)
                        return false;
                    for (var prop in obj) {
                        if (!helper.deepCompare(body[prop], obj[prop]))
                            return false;
                    }
                    return true;
                }
                else
                    return helper.deepCompare(body.data, obj);
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