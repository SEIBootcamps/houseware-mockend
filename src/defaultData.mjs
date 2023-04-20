import { randEmail, randFullName } from "@ngneat/falso";
import { v4 as uuidv4 } from "uuid";
import sample from "@stdlib/random-sample";
import housewares from "./data/housewares.json" assert { type: "json" };

const seedDefaultData = () => {
  const buyers = Array.from({ length: 10 }, () => ({
    id: uuidv4(),
    name: randFullName(),
    email: randEmail(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const sampleRandomBuyers = sample.factory(
    buyers.map((b) => b.id),
    { replace: false }
  );
  const randomNum = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    buyers,
    inventory: housewares.map(
      ({ id, category, color, sellPrice, imageUri, name }) => {
        return {
          id: id.toLowerCase(),
          category,
          color,
          sellPrice,
          imageUri,
          name,
          interestedBuyers: sampleRandomBuyers({ size: randomNum(1, 5) }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    ),
  };
};

export default seedDefaultData;
