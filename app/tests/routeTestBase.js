var testConnectionString = "mongodb://localhost/roundaway_test"
var sinon = require('sinon');
var request = require('supertest');
var expect = require('chai').expect;
var server = require('./../server');
var inject;
var funcs = [];
var verbs = {
    GET: 'GET',
    PUT: 'PUT',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
}
var auth = {
     PUBLIC: 'PUBLIC',
     AUTHORIZED: 'AUTHORIZED',
     ATTENDANT: 'ATTENDANT',
     OWNER: 'OWNER',
     ADMIN: 'ADMIN'
}
var id = '12a34567b8901c234d5e6789';

function RouteTest(ctrl, route, test, done) {
    //Auth:
    if (test.auth === auth.PUBLIC)
        ;//No auth check
    else {
        funcs.push(sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); }));
        if (test.auth === auth.AUTHORIZED)
            ;
        else if (test.auth === auth.ATTENDANT)
            funcs.push(sinon.stub(inject.helper, 'checkAttendant', function(q,s,n) { n(); }));
        else if (test.auth === auth.OWNER)
            funcs.push(sinon.stub(inject.helper, 'checkOwner', function(q,s,n) { n(); }));
        else if (test.auth === auth.ADMIN)
            funcs.push(sinon.stub(inject.helper, 'checkAdmin', function(q,s,n) { n(); }));
    }
    
    //Method:
    funcs.push(sinon.stub(inject[ctrl].prototype, test.method, function(q,s) { s.sendStatus(200) }));
    
    var body = {
        someObject: {
            someProp: 'some value'
        }
    }
    var app = server(inject);
    var st = null;

    //Verb and Route:
    if (test.verb == verbs.GET)
        st = request(app).get(route)
    else {
        if (test.verb == verbs.PUT)
            st = request(app).put(route)
        else if(test.verb == verbs.PATCH)
            st = request(app).patch(route)
        else if(test.verb == verbs.POST)
            st = request(app).post(route)
        else 
            st = request(app).delete(route)
        st.set('Content-Type', 'application/json')
        st.send(JSON.stringify(body))
    }
        
    expect(st).to.be.not.null;
    st.expect(200).end(function (err) {
        expect(err).to.not.be.ok;
        funcs.forEach(function (spy) {
            expect(spy.calledOnce, spy).to.be.true;
        })
        if (test.verb != verbs.GET)
            expect(app[ctrl][test.method].firstCall.args[0].body, 'request body was not parsed/passed correctly').to.eql(body);
        done();
    })
}

var RouteTestBase = function(controller, tests, only, skip) {
    var _describe = describe;
    if (only)
        _describe = describe.only;
    if (skip)
        _describe = describe.skip;
    _describe(controller + ' route', function() {
        tests.forEach(function(test) {
            var route = test.route.replace(':id', id);
            describe(test.verb + ' ' + test.route, function() {
                
                beforeEach(function() {
                    inject = server.GetDefaultInjection();
                })
                
                afterEach(function() {
                    while(funcs.length > 0) {
                        var func = funcs.pop();
                        if (func.restore)
                            func.restore();
                    }
                })
                
                it('should call correct method', function(done) {
                    RouteTest(controller, route, test, done);
                })
            })
        })
    })
} 

RouteTestBase.only = function(c, t) {
    RouteTestBase(c, t, true);
}

RouteTestBase.skip = function(c, t) {
    RouteTestBase(c, t, false, true);
}

RouteTestBase.verbs = verbs;
RouteTestBase.auth = auth;
RouteTestBase.RouteTest = RouteTest;
RouteTestBase.id = id;

module.exports = RouteTestBase;