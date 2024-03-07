function bodyValidation(req, res, acceptEnough=false) {
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error("Invalid data");
    res.status(400).send({ error: 'Invalid data' });
    return false;
  }

  if (!acceptEnough && Object.keys(req.body).length === 1 && req.body.accept !== null && req.body.accept !== undefined) {
    res.status(400).send({ error: 'Invalid data, body data should be present' });
    return false;
  }

  return true;
}

module.exports = { bodyValidation };
