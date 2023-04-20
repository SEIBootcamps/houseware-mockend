import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const initializeDB = (filename, defaultData) => {
  const file = join(dirname(fileURLToPath(import.meta.url)), filename);
  const adapter = new JSONFile(file);
  console.log(`Loading database from ${file}...`);
  const db = new Low(adapter, defaultData);
  return db;
};

// Middleware to read from/write to the database.
const dbMiddleware = ({ db }) => {
  return {
    readDB: async (req, res, next) => {
      await db.read();
      req.dbData = db.data;
      next();
    },
    writeDB: async (req, res, next) => {
      db.data = req.dbData;
      console.log("Writing to database...");
      await db.write();
      next();
    },
  };
};

export { initializeDB, dbMiddleware };
