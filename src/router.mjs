import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Router, json, static as expressStatic } from "express";
import alphabetize from "alphabetize-object-keys";
import { v4 as uuidv4 } from "uuid";
import { initializeDB, dbMiddleware } from "./db.mjs";
import seedDefaultData from "./defaultData.mjs";
import { logErrors, clientErrorHandler } from "./errors.mjs";

const router = Router();
const db = initializeDB("db.json", seedDefaultData());
const { readDB, writeDB } = dbMiddleware({ db });

router.use(json());
router.use(
  "/images",
  expressStatic(join(dirname(fileURLToPath(import.meta.url)), "data/images"))
);

router.get("/inventory", readDB, (req, res) => {
  const { inventory } = req.dbData;
  res.json(alphabetize(inventory));
});

router.get("/inventory/:id", readDB, (req, res) => {
  const { id } = req.params;
  const { inventory } = req.dbData;
  const item = inventory.find((item) => item.id === id);
  if (!item) {
    try {
      throw new Error("resource not found");
    } catch (err) {
      next(err);
    }
  } else {
    res.json(alphabetize(item));
  }
});

router.post(
  "/inventory",
  readDB,
  (req, res, next) => {
    const { inventory } = req.dbData;
    const defaultFields = {
      category: null,
      color: null,
      sellPrice: null,
      imageUri: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      interestedBuyers: [],
    };

    const { id, name, category, color, sellPrice, imageUri } = req.body;
    if (!id || !name) {
      try {
        throw new Error("missing required fields");
      } catch (err) {
        next(err);
      }
    }

    if (inventory.find((item) => item.id === id)) {
      try {
        throw new Error("resource already exists");
      } catch (err) {
        next(err);
      }
    }

    const newItem = {
      id,
      name,
      ...defaultFields,
      category: category ?? defaultFields.category,
      color: color ?? defaultFields.color,
      sellPrice: sellPrice ?? defaultFields.sellPrice,
      imageUri: imageUri ?? defaultFields.imageUri,
    };
    inventory.push(newItem);
    res.status(201).json(alphabetize(newItem));

    next();
  },
  writeDB
);

router.patch(
  "/inventory/:id",
  readDB,
  (req, res, next) => {
    const { id } = req.params;
    const { inventory } = req.dbData;

    const item = inventory.find((item) => item.id === id);
    if (!item) {
      try {
        throw new Error("resource not found");
      } catch (err) {
        next(err);
      }
    }

    const { name, category, color, sellPrice, imageUri } = req.body;
    const i = inventory.indexOf(item);
    inventory[i] = {
      ...item,
      name: name ?? item.name,
      category: category ?? item.category,
      color: color ?? item.color,
      sellPrice: sellPrice ?? item.sellPrice,
      imageUri: imageUri ?? item.imageUri,
      updatedAt: new Date().toISOString(),
    };
    res.json(alphabetize(inventory[i]));
    next();
  },
  writeDB
);

router.delete(
  "/inventory/:id",
  readDB,
  (req, res, next) => {
    const { id } = req.params;
    const { inventory } = req.dbData;
    const item = inventory.find((item) => item.id === id);
    if (!item) {
      try {
        throw new Error("resource not found");
      } catch (err) {
        next(err);
      }
    }

    const i = inventory.indexOf(item);
    inventory.splice(i, 1);
    res.status(204).send();
    next();
  },
  writeDB
);

router.get("/inventory/:id/buyers", readDB, (req, res) => {
  const { id } = req.params;
  const { inventory, buyers } = req.dbData;
  const item = inventory.find((item) => item.id === id);
  if (!item) {
    try {
      throw new Error("resource not found");
    } catch (err) {
      next(err);
    }
  }
  const itemBuyers = item.interestedBuyers.map((buyerId) =>
    buyers.find((b) => b.id === buyerId)
  );
  res.json(alphabetize(itemBuyers));
});

router.post(
  "/inventory/:id/buyers",
  readDB,
  (req, res, next) => {
    const { id } = req.params;
    const { inventory, buyers } = req.dbData;
    const { buyerId } = req.body;
    if (!buyerId) {
      try {
        throw new Error("missing required fields");
      } catch (err) {
        next(err);
      }
    }

    const buyer = buyers.find((b) => b.id === req.body.buyerId);
    const item = inventory.find((item) => item.id === id);
    if (!buyer || !item) {
      try {
        throw new Error("resource not found");
      } catch (err) {
        next(err);
      }
    }

    if (item.interestedBuyers.includes(buyerId)) {
      try {
        throw new Error("resource already exists");
      } catch (err) {
        next(err);
      }
    }

    item.interestedBuyers.push(buyerId);
    res.status(201).json(alphabetize(item));
    next();
  },
  writeDB
);

router.delete(
  "/inventory/:id/buyers",
  readDB,
  (req, res, next) => {
    const { id } = req.params;
    const { inventory } = req.dbData;
    const item = inventory.find((item) => item.id === id);
    if (!item) {
      try {
        throw new Error("resource not found");
      } catch (err) {
        next(err);
      }
    }
    const { buyerId } = req.body;
    if (!buyerId) {
      try {
        throw new Error("missing required fields");
      } catch (err) {
        next(err);
      }
    }
    const i = item.interestedBuyers.indexOf(buyerId);
    if (i === -1) {
      try {
        throw new Error("not modified");
      } catch (err) {
        next(err);
      }
    }

    item.interestedBuyers.splice(i, 1);
    res.status(204).send();
    next();
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
    try {
      throw new Error("resource not found");
    } catch (err) {
      next(err);
    }
  } else {
    res.json(alphabetize(buyer));
  }
});

router.post(
  "/buyers",
  readDB,
  (req, res, next) => {
    const { buyers } = req.dbData;

    if (!req.body.name || !req.body.email) {
      try {
        throw new Error("missing required fields");
      } catch (err) {
        next(err);
      }
    }
    if (buyers.find((b) => b.email === req.body.email)) {
      try {
        throw new Error("resource already exists");
      } catch (err) {
        next(err);
      }
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
    next();
  },
  writeDB
);

router.patch(
  "/buyer/:id",
  readDB,
  (req, res, next) => {
    const { id } = req.params;
    const { buyers } = req.dbData;

    const buyer = buyers.find((b) => b.id === id);
    if (!buyer) {
      try {
        throw new Error("resource not found");
      } catch (err) {
        next(err);
      }
    }

    const i = buyers.indexOf(i);
    buyers[i] = {
      ...buyer,
      ...req.body,
      id: buyer.id, // don't change id of item
      updatedAt: new Date().toISOString(),
    };
    res.json(alphabetize(buyers[i]));
    next();
  },
  writeDB
);

router.delete(
  "/buyers/:id",
  readDB,
  (req, res, next) => {
    const { id } = req.params;
    const { buyers } = req.dbData;
    const buyer = buyers.find((b) => b.id === id);
    if (!buyer) {
      try {
        throw new Error("resource not found");
      } catch (err) {
        next(err);
      }
    }

    const i = buyers.indexOf(buyer);
    buyers.splice(i, 1);
    res.status(204).send();
    next();
  },
  writeDB
);

router.use(logErrors);
router.use(clientErrorHandler);

export default router;
