import { Router, json } from "express";
import alphabetize from "alphabetize-object-keys";
import { v4 as uuidv4 } from "uuid";
import { initializeDB, dbMiddleware } from "./db.mjs";
import seedDefaultData from "./defaultData.mjs";
import { logErrors, clientErrorHandler } from "./errors.mjs";

const db = initializeDB("db.json", seedDefaultData());
const { readDB, writeDB } = dbMiddleware({ db });
const router = Router();
router.use(json());
router.use(logErrors);
router.use(clientErrorHandler);

router.get("/inventory", readDB, (req, res) => {
  const { inventory } = req.dbData;
  res.json(alphabetize(inventory));
});

router.get("/inventory/:id", readDB, (req, res) => {
  const { id } = req.params;
  const { inventory } = req.dbData;
  const item = inventory.find((item) => item.id === id);
  if (!item) {
    throw new Error("resource not found");
  } else {
    res.json(alphabetize(item));
  }
});

router.post(
  "/inventory",
  readDB,
  (req, res) => {
    const { inventory } = req.dbData;
    const defaultFields = {
      category: null,
      color: null,
      sellPrice: null,
      imageUri: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newItem = {
      ...defaultFields,
      ...req.body,
    };

    if (!newItem.id || !newItem.name) {
      throw new Error("missing required fields");
    }

    if (db.data.housewares.find((item) => item.id === newItem.id)) {
      throw new Error("resource already exists");
    }

    inventory.push(newItem);
    res.status(201).json(alphabetize(newItem));
  },
  writeDB
);

router.patch(
  "/inventory/:id",
  readDB,
  (req, res) => {
    const { id } = req.params;
    const { inventory } = req.dbData;

    const item = inventory.find((item) => item.id === id);
    if (!item) {
      throw new Error("resource not found");
    }

    const i = inventory.indexOf(i);
    inventory[i] = {
      ...item,
      ...req.body,
      id: item.id, // don't change id of item
      updatedAt: new Date().toISOString(),
    };
    res.json(alphabetize(inventory[i]));
  },
  writeDB
);

router.delete(
  "/inventory/:id",
  readDB,
  (req, res) => {
    const { id } = req.params;
    const { inventory } = req.dbData;
    const item = inventory.find((item) => item.id === id);
    if (!item) {
      throw new Error("resource not found");
    }

    const i = inventory.indexOf(item);
    inventory.splice(i, 1);
    res.status(204).send();
  },
  writeDB
);

router.get("/buyers", readDB, (req, res) => {
  const { buyers } = req.dbData;
  res.json(alphabetize(buyers));
});

router.get("/buyers/:id", readDB, (req, res) => {
  const { id } = req.params;
  const { buyers } = req.dbData;
  const buyer = buyers.find((b) => b.id === id);
  if (!buyer) {
    throw new Error("resource not found");
  } else {
    res.json(alphabetize(buyer));
  }
});

router.post(
  "/buyers",
  readDB,
  (req, res) => {
    const { buyers } = req.dbData;

    if (!req.body.name || !req.body.email) {
      throw new Error("missing required fields");
    }
    if (buyers.find((b) => b.email === req.body.email)) {
      throw new Error("resource already exists");
    }

    const defaultFields = {
      id: uuidv4(),
      wishlist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newBuyer = {
      ...defaultFields,
      ...req.body,
    };

    buyers.push(newBuyer);
    res.status(201).json(alphabetize(newBuyer));
  },
  writeDB
);

router.patch(
  "/buyer/:id",
  readDB,
  (req, res) => {
    const { id } = req.params;
    const { buyers } = req.dbData;

    const buyer = buyers.find((b) => b.id === id);
    if (!buyer) {
      throw new Error("resource not found");
    }

    const i = buyers.indexOf(i);
    buyers[i] = {
      ...buyer,
      ...req.body,
      id: buyer.id, // don't change id of item
      updatedAt: new Date().toISOString(),
    };
    res.json(alphabetize(buyers[i]));
  },
  writeDB
);

router.delete(
  "/buyers/:id",
  readDB,
  (req, res) => {
    const { id } = req.params;
    const { buyers } = req.dbData;
    const buyer = buyers.find((b) => b.id === id);
    if (!buyer) {
      throw new Error("resource not found");
    }

    const i = buyers.indexOf(buyer);
    buyers.splice(i, 1);
    res.status(204).send();
  },
  writeDB
);

export default router;
