import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

export async function concectarServidor() {
  mongoClient.connect(() => {
    db = mongoClient.db("api-bate-papo-uol");
  });
  return db
}

export function desconcectarServidor() {
  mongoClient.close()
  return
}

// export default { concectarServidor, desconcectarServidor };