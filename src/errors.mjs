const logErrors = (err, req, res, next) => {
  console.error(err.stack);
  next(err);
};

const clientErrorHandler = (err, req, res, next) => {
  switch (err.message) {
    case "resource not found":
      res.status(404).send();
      break;
    case "resource already exists":
      res.status(409).send();
      break;
    case "missing required fields":
      res.status(422).send();
      break;
    case "not modified":
      res.status(304).send();
      break;
  }
  next(err);
};

export { logErrors, clientErrorHandler };
