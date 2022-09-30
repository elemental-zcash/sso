import { client } from '../data/redis';
import { objNotNull } from './misc';

type UnknownObj = { [key: string]: unknown };

export const serialiseObjNest = (obj: UnknownObj): UnknownObj => {
  const res = {};
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v instanceof Date) {
      res[k] = v.toISOString();
    } else if (typeof v === 'object' && v !== null) {
      res[k] = JSON.stringify({ ...v, __type__: 'JSON' });
    } else {
      res[k] = v;
    }
  });
  return res;
};

export const deserialiseObjectNest = (obj: UnknownObj): UnknownObj => {
  const res = {};
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    try {
      if (typeof v !== 'string') {
        throw new Error();
      }
      const json = JSON.parse(v);
      if (json.__type__ === 'JSON') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { __type__, ...vals } = json;
        res[k] = vals;
      } else {
        throw new Error();
      }
    } catch (e) {
      res[k] = v;
    }
  });
  return res;
};

export const cacheGet = async (key): Promise<unknown> => {
  const cachedVal = await client.hgetall(key);
  if (objNotNull(cachedVal)) {
    return deserialiseObjectNest(cachedVal);
  }
  return null;
};

export const cacheDelete = async (key) => await client.del(key);

export const cacheSet = async (key, data) => {
  if (!data) {
    return;
  }

  const res = await client.hset(key, serialiseObjNest(data));

  if (!res) {
    await cacheDelete(key);
    return;
  }

  return true;
};

export const makeRedisSave = redisClient => async (args, relations?) => {
  for (const rKey in args) {
    if (args[rKey]) {
      const value = Object.assign({}, args[rKey]);

      if (relations) {
        Object.keys(relations).forEach((_mapKey) => {
          // eslint-disable-next-line no-underscore-dangle
          const _mapValue = relations[_mapKey];
          const [tableTo, keyTo] = _mapKey.split('.');
          const [tableFrom, keyFrom] = _mapValue.split('.');

          if (rKey === tableTo) {
            value[keyTo] = args[tableFrom][keyFrom];
            // console.log({ value });
          }
        });
      }

      // console.log('hmset: ', { value });
      await redisClient.hmset(`${rKey}:${args[rKey].id}`, value);
    }
  }
};
