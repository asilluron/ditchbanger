var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require('dotenv').config();
const Connector = require('../../src/lib/connector');
describe('connection', () => {
    test('can connect without errors', done => {
        let myConnector = new Connector(process.env.MONGO_URL, process.env.REDIS_URL);
        myConnector.on('ready', () => {
            done();
        });
    }, 10000);
    test('can get mongoose object', done => {
        let myConnector = new Connector(process.env.MONGO_URL, process.env.REDIS_URL);
        myConnector.on('ready', () => __awaiter(this, void 0, void 0, function* () {
            let myMongoose = yield myConnector.getMongooseReference();
            expect(myMongoose).toBeDefined();
            done();
        }));
    });
    test('show mongodb connection error', done => {
        let myConnector = new Connector("mongodb://localhost:27016", process.env.REDIS_URL);
        expect(myConnector.readyCount).not.toBe(2);
        done();
    });
});
describe('db operations', () => {
    let myConnector;
    let myMongoose;
    let testdb;
    beforeAll(() => __awaiter(this, void 0, void 0, function* () {
        myConnector = yield new Connector(process.env.MONGO_URL, process.env.REDIS_URL);
        myMongoose = myConnector.getMongooseReference();
        testdb = myMongoose.connection.db.collection('test');
    }));
    afterAll(() => {
        testdb.deleteMany({});
    });
    test('can insert', done => {
        let testDoc = { _id: '1234', name: 'test' };
        testdb.insertOne(testDoc, (err, rec) => {
            expect(err).toBeNull();
            done();
        });
    });
    test('can get', done => {
        let testDoc = { _id: '1234' };
        testdb.find(testDoc).limit(1).toArray((err, docs) => {
            expect(err).toBeNull();
            expect(docs.length).toBe(1);
            done();
        });
    });
    test('can update', done => {
        let testDoc = { _id: '1234' };
        testdb.findOneAndUpdate(testDoc, { $set: { name: 'test2' } }, (err, docs) => {
            expect(err).toBeNull();
            done();
        });
    });
    test('can delete', done => {
        let testDoc = { _id: '1234' };
        testdb.findOneAndDelete(testDoc, (err, rec) => {
            expect(err).toBeNull();
            done();
        });
    });
});
//# sourceMappingURL=connector-test.js.map