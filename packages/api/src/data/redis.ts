import Redis from 'ioredis';
import { promisify } from 'util';

import { makeRedisSave } from '../utils/redis';

const redisArgs = {
  port: 6379,
  host: 'redis',
  password: process.env.REDIS_PSWD || '',
};

export const client = new Redis(redisArgs);
export const publisher = new Redis(redisArgs);
export const subscriber = new Redis(redisArgs);

export const publish = publisher.publish;
export const subscribe = subscriber.subscribe;

export const saveRedis = makeRedisSave(client);

export const getBuffer = client.getBuffer;
