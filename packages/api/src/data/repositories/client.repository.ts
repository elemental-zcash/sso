import { OAuthClientType, OAuthClient } from '../../models';
import { cacheSaveEntity, cacheSearchEntity, ModelToType } from '../../utils';
import { db } from '../pg';

import Repository from './repository';


type ClientType = Omit<OAuthClientType, 'id'> & {
  id: string,
  dbIndex: number,
};

const checkClientFound = (client) => {
  if (!client) {
    throw new Error('Client not found');
  }
  return client;
};

const formatClient = (client: OAuthClientType): ClientType => {
  if (!client) {
    throw new Error('OAuth client not found');
  }
  const { id, ..._client } = client;

  return {
    ..._client,
    id: undefined,
    dbIndex: id,
  };
}

class ClientRepository extends Repository {
  __type = 'clients';

  async findById(clientId: string) {
    const cachedClient = await cacheSearchEntity<OAuthClient>({ clientId }, db.clients.model, this.redisRepo);

    if (cachedClient) {
      return cachedClient;
    }
    // const authCodeRes = await db.clients.findById(clientId);
    const client = formatClient(checkClientFound(await db.clients.findById(clientId)));
    await cacheSaveEntity<OAuthClient, ClientType>(client, db.clients.model, this.redisRepo);

    return client;
  }
  // async findByUser(publicId: string) {
  //   const redisRepo = this.getRedisRepo();
  //   const cachedAuthCode = await cacheSearchEntity<OAuthClientType>({ userId: publicId }, db.clients.model, redisRepo);

  //   if (cachedAuthCode) {
  //     return cachedAuthCode;
  //   }
  //   const user = await db.users.findById(publicId);
  //   if (!user.id) {
  //     return;
  //   }
  //   const authCode = formatClient(checkClientFound(await db.clients.findByUserIndex(user.id)), publicId);
  //   await cacheSaveEntity<OAuthClientType>(authCode, db.clients.model, redisRepo);

  //   return authCode;
  // }

  async create(data) {
    // const res = await db.clients.addCode(data);
    if (!await db.clients.add(data)) {
      return null;
    }
    const client = formatClient(data);

    if (!client) {
      return null;
    }

    await cacheSaveEntity<OAuthClient, ClientType>(client, db.clients.model, this.redisRepo);

    return client;
  }
  async deleteById(publicId: string) {

  }
  async update() {

  }
}



export default ClientRepository;
