# Animal Crossing Houseware Mockend

An Express router module to mount a mock RESTful API backend. It comes pre-seeded with a
subset of data from [ACNHAPI](https://github.com/alexislours/ACNHAPI).

[View the API documentation here](https://github.com/SEIBootcamps/houseware-mockend/wiki).

## Getting started

Install the package.

```
npm add --save SEIBootcamps/houseware-mockend
```

Mount to your Express app:

```js
import express from "express";

import api from "houseware-mockend";

const app = express();
app.use("/api", api);
```
