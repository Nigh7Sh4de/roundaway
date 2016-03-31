var sinon = require('sinon');
var request = require('supertest');
var expect = require('chai').expect;
var server = require('./../../server');
var inject = server.GetDefaultInjection();

var funcs = [];
var verbs = {
    GET: 'GET',
    PUT: 'PUT',
    PATCH: 'PATCH'
}
var userId = '12a34567b8901c234d5e6789';

afterEach(function() {
    funcs.forEach(function(func) {
        if (func.restore)
            func.restore();
    });
})

function HappyPathRouteTest(ctrl, verb, route, ignoreAdmin, ignoreAuth, method, reqMock, body, dbInjection, testOutput, assertions, done) {
    if (reqMock != null) {
        var _method = inject[ctrl].prototype[method];
        funcs.push(sinon.stub(inject[ctrl].prototype, method, function(q,s) { _method(reqMock,s); }));
    }
    
    if (!ignoreAuth)
        funcs.push(sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); }));
    if (!ignoreAdmin)
        funcs.push(sinon.stub(inject.helper, 'checkAdmin', function(q,s,n) { n(); }));
    
    inject.db = dbInjection;
    var app = server(inject);
    var st = null;
    if (verb == verbs.GET)
        st = request(app).get(route)
    else {
        if (verb == verbs.PUT)
            st = request(app).put(route)
        else
            st = request(app).patch(route)
        st.set('Content-Type', 'application/json')
        st.send(JSON.stringify(body))
    } 
    expect(st).to.be.not.null;
    st.expect(200).end(function (err, res) {
        expect(err).to.not.be.ok;
        if (testOutput != null)
            expect(res.body).to.eql(testOutput);
        if (assertions != null && typeof assertions === 'function')
            assertions();
        done();
    });

}

function SadPathRouteTest() {
    throw new Error('Not implemented.');
}

function RouteTest(ctrl, verb, route, ignoreUserId, ignoreAdmin, ignoreAuth, method, methodParams, done) {
    funcs = [];
    if (!ignoreAuth)
        funcs.push(sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); }));
    
    if (!ignoreAdmin)
        funcs.push(sinon.stub(inject.helper, 'checkAdmin', function(q,s,n) { n(); }));
            
    var func, _func;
    if (!methodParams)
        func = sinon.stub(inject[ctrl].prototype, method, function(q,s) { s.sendStatus(200) });
    else {
        func = func = sinon.spy(function(q,s) { s.sendStatus(200) });
        _func = sinon.stub(inject[ctrl].prototype, method, function(params) { return func });
        
    }
    funcs.push(func);
    if (_func != null)
        funcs.push(_func);
    
    var body = {
        someObject: {
            someProp: 'some value'
        }
    }
    var app = server(inject);
    funcs.forEach(function(spy) {
        if (spy != _func)
            spy.reset();
    })
    var st = null;
    if (verb == verbs.GET)
        st = request(app).get(route)
    else {
        if (verb == verbs.PUT)
            st = request(app).put(route)
        else
            st = request(app).patch(route)
        st.set('Content-Type', 'application/json')
        st.send(JSON.stringify(body))
    }
        
    expect(st).to.be.not.null;
    st.expect(200).end(function (err) {
        expect(err).to.not.be.ok;
        funcs.forEach(function (spy) {
            if (spy != _func)
                expect(spy.calledOnce, spy).to.be.true;
            else
                expect(spy.args).to.deep.include.members([methodParams]);
        })
        if (!ignoreUserId)
            expect(func.firstCall.args[0].params.userid).to.equal(userId);
        if (verb != verbs.GET)
            expect(func.firstCall.args[0].body).to.eql(body);
        done();
    })
}

var RouteTestBase = function(controller, tests) {
    tests.forEach(function(test) {
        var route = test.route.replace(':userid', userId);
        describe(test.verb + ' ' + test.route, function() {
            it('should call correct method', function(done) {
                RouteTest(controller, test.verb, route, test.ignoreUserId, test.ignoreAdmin, test.ignoreAuth, test.method, test.methodParams, done);
            })
            
            if (!test.ignoreHappyPath)
                it('should send success on happy path', function(done) {
                    HappyPathRouteTest(controller, test.verb, route, test.ignoreAdmin, test.ignoreAuth, test.method, test.req, test.body, test.dbInjection, test.output, test.assertions, done);
                })

            if (!test.ignoreSadPath)
                it('should send error on sad path', function(done) {
                    SadPathRouteTest(done);
                })
        })
    })
} 

RouteTestBase.verbs = verbs;
RouteTestBase.RouteTest = RouteTest;
RouteTestBase.userid = userId;

module.exports = RouteTestBase;