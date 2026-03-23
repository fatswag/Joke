const amqp = require('amqplib');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// DB connection
// moved into lib/joke-db.js for separation of concerns
const db = require('./lib/joke-db.js');

const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE || 'submit-jokes';

async function startConsumer() {
  try {
    db.createConnectionPool();
    const dbName = await db.isConnected();
    console.log(`Connected to MySQL database "${dbName}"`);

    // connect to rabbitmq on the submit VM
    const conn = await amqp.connect(`amqp://${RABBITMQ_HOST}:${RABBITMQ_PORT}`);
    const channel = await conn.createChannel();

    await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });

    console.log(`Waiting for messages on queue "${RABBITMQ_QUEUE}"`);

    channel.consume(RABBITMQ_QUEUE, async (msg) => {
      if (!msg) return;

      try {
        const jokeData = JSON.parse(msg.content.toString());

        let { type, setup, punchline } = jokeData;

        // basic cleanup
        type = (type || '').trim().toLowerCase();
        setup = (setup || '').trim();
        punchline = (punchline || '').trim();

        // skip bad messages
        if (!type || !setup || !punchline) {
          console.log('Bad message skipped');
          channel.ack(msg);
          return;
        }

        // make sure type exists first
        await db.upsertType(type);

        // get id for that type
        const type_id = await db.getTypeIdByName(type);

        if (!type_id) {
          throw new Error('Type lookup failed');
        }

        // insert the joke into the DB
        await db.insertJoke(type_id, setup, punchline);

        console.log(`Inserted joke for type "${type}"`);

        // tell rabbitmq the message has been handled
        channel.ack(msg);

      } catch (err) {
        console.error('ETL error:', err.message);
      }
    });

  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
}

startConsumer();