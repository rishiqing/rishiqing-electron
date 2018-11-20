const Datastore = require('nedb');
const path      = require('path');

class Db {
  constructor(filename, autoload = true) {
    this.store = new Datastore({ filename, autoload });
  }

  async findOne (query) {
    return new Promise((resolve, reject) => {
      this.store.findOne(query, function (err, doc) {
        if (err) reject(err);
        else resolve(doc);
      });
    });
  }

  update (query, update, options, callback) {
    this.store.update(query, update, options, callback);
  }

  remove(query, options, callback){
    this.store.remove(query, options, callback)
  }
}

module.exports = Db;