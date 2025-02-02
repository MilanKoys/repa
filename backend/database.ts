import { Db, MongoClient } from "mongodb";

let mongodb: null | MongoClient = null;

function initDatabase(connectionString: string) {
  mongodb = new MongoClient(connectionString);
  return mongodb;
}

function getDatabase(databaseName: string): Db | false {
  if (!mongodb) return false;
  const db = mongodb.db(databaseName);
  return db;
}

export { getDatabase, initDatabase };
