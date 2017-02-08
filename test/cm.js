process.env.CM_KEY = 'chrC9e52tR5ljd+02Shg6khojHNUpAhaqAplQ1jFgCw='

var supertest = require('supertest')(require('../main.js'));
var assert = require('assert');

describe('Test CM endpoints', function() {
	it('POST /cm/upsert-container-info — No API key', (done) => {
		supertest
			.post('/cm/upsert-container-info')
			.expect(401, 'Missing API key', done);
	});

	it('POST /cm/upsert-container-info — Invalid key (in header)', (done) => {
		supertest
			.post('/cm/upsert-container-info')
			.set('X-Api-Key', 'aaa')
			.expect(401, 'Unauthorized: Arbiter key invalid', done);
	});

	it('POST /cm/upsert-container-info — Invalid key (as basic auth)', (done) => {
		supertest
			.post('/cm/upsert-container-info')
			.auth('aaa')
			.expect(401, 'Unauthorized: Arbiter key invalid', done);
	});

	it('POST /cm/upsert-container-info — No data', (done) => {
		supertest
			.post('/cm/upsert-container-info')
			.auth(process.env.CM_KEY)
			.expect(400, 'Missing parameters', done);
	});

	it('POST /cm/upsert-container-info — No name', (done) => {
		supertest
			.post('/cm/upsert-container-info')
			.auth(process.env.CM_KEY)
			.set('Content-Type', 'application/json')
			.send({})
			.expect(400, 'Missing parameters', done);
	});

	var testData = {
		name: 'test-store'
	};

	it('POST /cm/upsert-container-info — Minimum required', (done) => {
		supertest
			.post('/cm/upsert-container-info')
			.auth(process.env.CM_KEY)
			.set('Content-Type', 'application/json')
			.send(testData)
			.expect('Content-Type', /json/)
			.expect(200, testData, done);
	});

	it('POST /cm/upsert-container-info — Upsert new data', (done) => {
		testData.nums = [ 1, 2, { half: 2.5 } ];

		supertest
			.post('/cm/upsert-container-info')
			.auth(process.env.CM_KEY)
			.set('Content-Type', 'application/json')
			.send(testData)
			.expect('Content-Type', /json/)
			.expect(200, testData, done);
	});

	it('POST /cm/add-container-routes — Add container routes, no target', (done) => {
		var routes = {
			GET:  '/some/path'
		};

		supertest
			.post('/cm/add-container-routes')
			.auth(process.env.CM_KEY)
			.set('Content-Type', 'application/json')
			.send({
				name: testData.name,
				routes: routes
			})
			.expect(400, 'Missing parameters', done);
	});

	it('POST /cm/add-container-routes — Add container routes', (done) => {
		var routes = {
			GET:  '/some/path',
			POST: [ '/a/c', '/a/b', '/a/c' ],
			ETC:  '/*'
		};

		var expected = {
			GET:  [ '/some/path' ],
			POST: [ '/a/c', '/a/b', '/a/c' ],
			ETC:  [ '/*' ]
		};

		supertest
			.post('/cm/add-container-routes')
			.auth(process.env.CM_KEY)
			.set('Content-Type', 'application/json')
			.send({
				name: testData.name,
				target: 'b',
				routes: routes
			})
			.expect('Content-Type', /json/)
			.expect(200, expected, done);
	});

	it('POST /cm/add-container-routes — Add container routes, different target', (done) => {
		var routes = {
			GET:  '/other/path',
			POST: [ '/a/z', '/a/b', '/a/c' ],
			ETC:  '/*'
		};

		var expected = {
			GET:  [ '/other/path' ],
			POST: [ '/a/z', '/a/b', '/a/c' ],
			ETC:  [ '/*' ]
		};

		supertest
			.post('/cm/add-container-routes')
			.auth(process.env.CM_KEY)
			.set('Content-Type', 'application/json')
			.send({
				name: testData.name,
				target: 'a',
				routes: routes
			})
			.expect('Content-Type', /json/)
			.expect(200, expected, done);
	});

	it('POST /cm/delete-container-routes — Delete container routes', (done) => {
		var routes = {
			POST: [ '/a/c' ],
			ETC:  '/*'
		};

		var expected = {
			GET:  [ '/some/path' ],
			POST: [ '/a/b' ],
			ETC:  []
		};

		supertest
			.post('/cm/delete-container-routes')
			.auth(process.env.CM_KEY)
			.set('Content-Type', 'application/json')
			.send({
				name: testData.name,
				target: 'b',
				routes: routes
			})
			.expect('Content-Type', /json/)
			.expect(200, expected, done);
	});

	it('POST /cm/delete-container-info — No data', (done) => {
		supertest
			.post('/cm/delete-container-info')
			.auth(process.env.CM_KEY)
			.expect(400, 'Missing parameters', done);
	});

	it('POST /cm/delete-container-info — No name', (done) => {
		supertest
			.post('/cm/delete-container-info')
			.auth(process.env.CM_KEY)
			.set('Content-Type', 'application/json')
			.send({})
			.expect(400, 'Missing parameters', done);
	});

	it('POST /cm/delete-container-info — With name', (done) => {
		supertest
			.post('/cm/delete-container-info')
			.auth(process.env.CM_KEY)
			.set('Content-Type', 'application/json')
			.send(testData)
			.expect(200, done);
	});
});