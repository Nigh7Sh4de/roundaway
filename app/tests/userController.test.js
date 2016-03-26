var expect = require('chai').expect;
var User = require('./../models/User');
var Lot = require('./../models/Lot');
var Spot = require('./../models/Spot');
var Booking = require('./../models/Booking');

describe.only('userController', function() {
    describe('addLot', function() {
        it('should add the given lotId to the user', function(done) {
            var lot = new Lot();
            var user = new User();
            expect(user.lotIds).to.be.empty;
            
            user.addLot(lot.id, function(err) {
                expect(err).to.not.be.ok;
                expect(user.lotIds).to.have.length(1).and.to.contain(lot.id);
                done();
            });;
        });
        
        it('should add the given lot object to the user', function(done) {
            var lot = new Lot();
            var user = new User();
            expect(user.lotIds).to.be.empty;
            
            user.addLot(lot, function(err) {
                expect(err).to.not.be.ok;
                expect(user.lotIds).to.have.length(1).and.to.contain(lot.id);
                done();
            })
        });
        
        it('should error on null input', function(done) {
            var user = new User();
            expect(user.lotIds).to.be.empty;
            user.addLot(undefined, function(err) {
                expect(user.lotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it('should error on null id', function(done) {
            var user = new User();
            var lot = {
                someproperty: 'some value'
            }
            expect(user.lotIds).to.be.empty;
            user.addLot(lot, function(err) {
                expect(user.lotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it ('should error on improper id', function(done) {
            var user = new User();
            var lot = {
                id: {}
            }
            expect(user.lotIds).to.be.empty;
            user.addLot(lot, function(err) {
                expect(user.lotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
    });
    
    describe('addSpot', function() {
        it('should add the given spotId to the user', function(done) {
            var spot = new Spot();
            var user = new User();
            expect(user.spotIds).to.be.empty;
            
            user.addSpot(spot.id, function(err) {
                expect(err).to.not.be.ok;
                expect(user.spotIds).to.have.length(1).and.to.contain(spot.id);
                done();
            });;
        });
        
        it('should add the given spot object to the user', function(done) {
            var spot = new Spot();
            var user = new User();
            expect(user.spotIds).to.be.empty;
            
            user.addSpot(spot, function(err) {
                expect(err).to.not.be.ok;
                expect(user.spotIds).to.have.length(1).and.to.contain(spot.id);
                done();
            })
        });
        
        it('should error on null input', function(done) {
            var user = new User();
            expect(user.spotIds).to.be.empty;
            user.addSpot(undefined, function(err) {
                expect(user.spotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it('should error on null id', function(done) {
            var user = new User();
            var spot = {
                someproperty: 'some value'
            }
            expect(user.spotIds).to.be.empty;
            user.addSpot(spot, function(err) {
                expect(user.spotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it ('should error on improper id', function(done) {
            var user = new User();
            var spot = {
                id: {}
            }
            expect(user.spotIds).to.be.empty;
            user.addSpot(spot, function(err) {
                expect(user.spotIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
    });
    
    describe('addBooking', function() {
        it('should add the given bookingId to the user', function(done) {
            var booking = new Booking();
            var user = new User();
            expect(user.bookingIds).to.be.empty;
            
            user.addBooking(booking.id, function(err) {
                expect(err).to.not.be.ok;
                expect(user.bookingIds).to.have.length(1).and.to.contain(booking.id);
                done();
            });;
        });
        
        it('should add the given booking object to the user', function(done) {
            var booking = new Booking();
            var user = new User();
            expect(user.bookingIds).to.be.empty;
            
            user.addBooking(booking, function(err) {
                expect(err).to.not.be.ok;
                expect(user.bookingIds).to.have.length(1).and.to.contain(booking.id);
                done();
            })
        });
        
        it('should error on null input', function(done) {
            var user = new User();
            expect(user.bookingIds).to.be.empty;
            user.addBooking(undefined, function(err) {
                expect(user.bookingIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it('should error on null id', function(done) {
            var user = new User();
            var booking = {
                someproperty: 'some value'
            }
            expect(user.bookingIds).to.be.empty;
            user.addBooking(booking, function(err) {
                expect(user.bookingIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
        
        it ('should error on improper id', function(done) {
            var user = new User();
            var booking = {
                id: {}
            }
            expect(user.bookingIds).to.be.empty;
            user.addBooking(booking, function(err) {
                expect(user.bookingIds).to.be.empty;
                expect(err).to.be.ok;
                done();
            });
        });
    });
})