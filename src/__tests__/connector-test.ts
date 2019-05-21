require('dotenv').config();
const Connector = require('../../src/lib/connector');
describe('connection',()=>{
	test('can connect without errors',done=>{
		let myConnector = new Connector(process.env.MONGO_URL, process.env.REDIS_URL);
		myConnector.on('ready',()=>{
			done();
		});
	}, 10000);
	test('can get mongoose object',done=>{
		let myConnector = new Connector(process.env.MONGO_URL, process.env.REDIS_URL);
		myConnector.on('ready',async()=>{
			let myMongoose = await myConnector.getMongooseReference();
			expect(myMongoose).toBeDefined();
			done();
		});
	});
	test('show mongodb connection error',done=>{
		let myConnector = new Connector("mongodb://localhost:27016", process.env.REDIS_URL);
		expect(myConnector.readyCount).not.toBe(2);
		done();
	});
});
describe('db operations',()=>{
	let myConnector:any;
	let myMongoose:any;
	let testdb:any;

	beforeAll(async()=>{
		myConnector = await new Connector(process.env.MONGO_URL, process.env.REDIS_URL);
		myMongoose = myConnector.getMongooseReference();
		testdb = myMongoose.connection.db.collection('test');
	});
	afterAll(()=>{
		testdb.deleteMany({});
	});
	test('can insert',done=>{
		let testDoc = {_id:'1234',name:'test'};
		testdb.insertOne(testDoc,(err:any,rec:Object)=>{
			expect(err).toBeNull();
			done();
		});
	});
	test('can get',done=>{
		let testDoc = {_id:'1234'};
		testdb.find(testDoc).limit(1).toArray((err:any,docs:Array<Object>)=>{
			expect(err).toBeNull();
			expect(docs.length).toBe(1);
			done();
		});
	});
	test('can update',done=>{
		let testDoc = {_id:'1234'};
		testdb.findOneAndUpdate(testDoc,{$set:{name:'test2'}},(err:any,docs:Array<Object>)=>{
			expect(err).toBeNull();
			done();
		});
	});
	test('can delete',done=>{
		let testDoc = {_id:'1234'};
		testdb.findOneAndDelete(testDoc,(err:any,rec:Array<Object>)=>{
			expect(err).toBeNull();
			done();
		});
	});
});
