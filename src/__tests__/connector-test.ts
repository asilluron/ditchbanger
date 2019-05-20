require('dotenv').config()
const Connector = require('../../src/lib/connector');

test('Can connect with no errors', async () => {
    const myConnector = new Connector(process.env.MONGO_URL, process.env.REDIS_URL);
    myConnector.on('ready', () => {
        expect(true).toBe(true); // We made it to a ready state
    });
});