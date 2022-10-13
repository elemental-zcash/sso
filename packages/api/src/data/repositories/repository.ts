import { redisOm } from '../redis';

class Repository {
  constructor() {}
  __type: '' | string = '';
  private _redisRepo: any;

  get redisRepo() {
    if (this._redisRepo) {
      return this._redisRepo;
    }
    if (redisOm.isInitialized) {
      this._redisRepo = redisOm.repos[this.__type];
      return this._redisRepo;
    }
    return null;
  }
}

export default Repository;
