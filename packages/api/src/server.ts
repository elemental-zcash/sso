import http from 'http';
// import RedisServer from 'redis-server';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();


import app from './app';
import { publisher, redisClient, subscriber } from './data';

const port = process.env.PORT || 8080;

const server = http.createServer(app);


const onListening = () => {
  const address = server.address();
  const bind = (typeof address === 'string') ? `pipe ${address}` : `port ${address.port}`;

  console.log(`Listening on: ${bind}`);
};


server.listen(port);

server.on('listening', onListening);

// subscriber.on('message', redisListener);
// subscriber.subscribe(['global', 'api']);

const serverCloseAsync = () => new Promise((resolve, reject) => {
  try {
    server.close(() => {
      resolve(null);
    });
  } catch (e) {
    reject(e);
  }
});


const onServerStop = async () => {
  try {
    try {
      await redisClient.quit();
      await subscriber.quit();
      await publisher.quit();
    } catch(err) {
      console.error(err);
      // suppress Redis quit errors for now
    }
    // await redisServer.close();
    await serverCloseAsync();

    console.log('Server stopped.');
    process.exit();
  } catch (err) {
    console.log('Failed to stop server');
  }
};

process.on('exit', onServerStop);

process.on('SIGINT', onServerStop);

process.on('SIGUSR1', onServerStop);
process.on('SIGUSR2', onServerStop);

