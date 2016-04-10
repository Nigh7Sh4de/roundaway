var expect = require('chai').expect;
var sinon = require('sinon');
var Lot = require('./../models/Lot');
var Spot = require('./../models/Spot');

describe.only('Lot schema', function() {
    before(function() {
        sinon.stub(Lot.prototype, 'save', function(cb) { cb() });
    })
    
    after(function() {
        Lot.prototype.save.restore();
    })
    
    describe('getSpots', function() {
        it('should return the spots attached to the lot', function() {
            var l = new Lot();
            var spots = ['123','456']; 
            l.spots = spots;
            expect(l.getSpots()).to.deep.equal(spots);
        });
        
        it('should return an empty array if no spots are added', function() {
            var l = new Lot();
            var spots = l.getSpots();
            expect(spots).to.be.an.instanceOf(Array);
            expect(spots).to.have.length(0);
        })
    })
    
    describe('addSpots', function() {
        it('should add a list of spots to the array', function(done) {
            var spots = [new Spot(), new Spot()];
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            l.addSpots(spots, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spots).to.have.length(spots.length);
                spots.forEach(function(spot) {
                    expect(l.spots).to.include(spot.id);
                })
                done();
            });
        })
        
        it('should add a list of spot ids to the array', function(done) {
            var spots = ['123','456'];
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            l.addSpots(spots, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spots).to.have.length(spots.length);
                spots.forEach(function(spot) {
                    expect(l.spots).to.include(spot);
                })
                done();
            });
        })
        
        it('should add a single spot to the array', function(done) {
            var spot = new Spot();
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            l.addSpots(spot, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spots).to.have.length(1);
                expect(l.spots).to.include(spot.id);
                done();
            });
        })
        
        it('should add a single spot id to the array', function(done) {
            var spot = '123';
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            l.addSpots(spot, function(err) {
                expect(err).to.not.be.ok;
                expect(l.spots).to.have.length(1);
                expect(l.spots).to.include(spot);
                done();
            });
        })
        
        it('should fail if given bad input', function(done) {
            var l = new Lot();
            expect(l.spots).to.have.length(0);
            [
                null,
                undefined,
                123,
                function(){expect.fail()},
                {},
                {id:123},
                {id:null},
                {id:function(){expect.fail()}}
            ].forEach(function(input, i, arr) {
                l.addSpots(input, function(err) {
                    expect(err).to.be.ok;
                    expect(l.spots).to.have.length(0);
                    if (i+1 >= arr.length)
                        done();
                })
            })
            
        })
    })
})