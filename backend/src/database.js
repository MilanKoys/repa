import { MongoClient } from "mongodb";
let mongodb = null;
function initDatabase(connectionString) {
    mongodb = new MongoClient(connectionString);
    return mongodb;
}
function getDatabase(databaseName) {
    if (!mongodb)
        return false;
    const db = mongodb.db(databaseName);
    return db;
}
export { getDatabase, initDatabase };
