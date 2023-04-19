import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { Router } from "express";
import bodyParser from "body-parser";

import housewares from "./data/housewares.json" assert { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, "db.json");

const adapter = new JSONFile(file);
const defaultData = {
  housewares: housewares.map((item) => ({
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  inventory: [],
};
const db = new Low(adapter, defaultData);
const sortByUpdatedAt = (a, b) => {
  const aUpdated = new Date(a.updatedAt);
  const bUpdated = new Date(b.updatedAt);
  return aUpdated > bUpdated ? -1 : 1;
};

const router = Router();

router.use(bodyParser.urlencoded()).use(bodyParser.json());

router.get("/housewares", async (req, res) => {
  await db.read();
  res.json(db.data.housewares.sort(sortByUpdatedAt));
});

router.get("/housewares/:id", async (req, res) => {
  await db.read();

  const { id } = req.params;
  const item = db.data.housewares.find((item) => item.id === id);

  res.json(item) ?? res.status(404).send();
});

router.post("/housewares", async (req, res) => {
  await db.read();

  const defaultFields = {
    category: undefined,
    buyPrice: undefined,
    sellPrice: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const newItem = {
    ...defaultFields,
    ...req.body,
  };

  if (!newItem.id || !newItem.name) {
    res.status(422).send(); // missing required fields
    return;
  }

  if (db.data.housewares.find((item) => item.id === newItem.id)) {
    res.status(409).send(); // resource already exists
    return;
  }

  db.data.housewares.push(newItem);
  await db.write();
  res.status(201).json(newItem);
});

router.patch("/housewares/:id", async (req, res) => {
  await db.read();

  const { id } = req.params;
  const item = db.data.housewares.find((item) => item.id === id);

  if (!item) {
    res.status(404).send();
    return;
  }

  const i = db.data.housewares.indexOf(item);
  db.data.housewares[i] = {
    ...item,
    ...req.body,
    id: item.id, // don't change id of item
    updatedAt: new Date().toISOString(),
  };

  await db.write();
  res.json(db.data.housewares[i]);
});

router.delete("/housewares/:id", async (req, res) => {
  await db.read();

  const { id } = req.params;
  const item = db.data.housewares.find((item) => item.id === id);
  if (!item) {
    res.status(404).send();
    return;
  }

  const i = db.data.housewares.indexOf(item);
  db.data.housewares.splice(i, 1);
  await db.write();
  res.status(204).send();
});

router.get("/inventory", async (req, res) => {
  await db.read();
  res.json(db.data.inventory.sort(sortByUpdatedAt));
});

router.get("/inventory/:id", async (req, res) => {
  await db.read();

  const { id } = req.params;
  const item = db.data.inventory.find((item) => item.id === id);

  res.json(item) ?? res.status(404).send();
});

router.post("/inventory", async (req, res) => {
  await db.read();

  const defaultFields = {
    quantity: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const newItem = {
    ...defaultFields,
    ...req.body,
  };

  if (!newItem.itemId) {
    res.status(422).send(); // missing required fields
    return;
  }

  if (!db.data.housewares.find((item) => item.id === newItem.itemId)) {
    res.status(304).send(); // not modified because itemId doesn't exist
    return;
  }

  if (db.data.inventory.find((item) => item.id === newItem.id)) {
    res.status(409).send(); // resource already exists
    return;
  }

  db.data.inventory.push(newItem);
  await db.write();
  res.status(201).json(newItem);
});

router.patch("/inventory/:id", async (req, res) => {
  await db.read();

  const { id } = req.params;
  const item = db.data.inventory.find((item) => item.itemId === id);

  if (!item) {
    res.status(404).send();
    return;
  }

  const i = db.data.inventory.indexOf(item);
  db.data.inventory[i] = {
    ...item,
    ...req.body,
    itemId: item.itemId, // don't change id of item
    updatedAt: new Date().toISOString(),
  };

  await db.write();

  res.json(db.data.inventory[i]);
});

router.delete("/inventory/:id", async (req, res) => {
  await db.read();

  const { id } = req.params;
  const item = db.data.inventory.find((item) => item.itemId === id);

  if (!item) {
    res.status(404).send();
    return;
  }

  const i = db.data.inventory.indexOf(item);
  db.data.inventory.splice(i, 1);

  await db.write();

  res.status(204).send();
});

export default router;
