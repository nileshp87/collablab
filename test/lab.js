var should = require('should');
var assert = require('assert');
var request = require('supertest');
var redis = require('redis');
var config = require('../config.js');
var client = redis.createClient();
require = require('really-need');
describe('Endpoint', function() {
  var url = 'http://localhost:8080/lab/';
  var site;

  beforeEach(function(done){
    client.flushall();
    site = require('../index.js');
    done();
  });

  afterEach(function(done){
    site.internal.close(function(){
      site.external.close(done);
    });
  });

  describe('Lab', function() {
    it('Should allow admin user to swipe in.', function(done) {
      var swipeData = {
        idNumber: config.adminId
      };
      request(url)
      	.post('/swipe')
      	.send(swipeData)
      	.end(function(err, res) {
          res.text.should.be.exactly('0');
          request(url)
            .get('/status')
            .end(function(err, res){
              res.body.open.should.be.exactly(true);
              Object.keys(res.body.members).length.should.be.exactly(1);
              res.body.members[config.adminUsername].should.be.exactly(config.adminName);
              done();
            });
          if (err) {
            throw err;
          }
      });
    });

    /*
    it('should correctly update an existing account', function(done){
	var body = {
		firstName: 'JP',
		lastName: 'Berd'
	};
	request(url)
		.put('/api/profiles/vgheri')
		.send(body)
		.expect('Content-Type', /json/)
		.expect(200) //Status code
		.end(function(err,res) {
			if (err) {
				throw err;
			}
			// Should.js fluent syntax applied
			res.body.should.have.property('_id');
	                res.body.firstName.should.equal('JP');
	                res.body.lastName.should.equal('Berd');
	                res.body.creationDate.should.not.equal(null);
			done();
		});
	});
  */
  });
});
