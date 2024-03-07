function bodyValidation(req, res, acceptEnough=false) {
  if ((req.body.constructor === Object)) {
    if (Object.keys(req.body).length === 0 || (!acceptEnough && Object.keys(req.body).length === 1 && req.body.accept !== null && req.body.accept !== undefined))
    console.error("Invalid data");
    res.status(400).send({ error: 'Invalid data' });
    return false;
  }
  return true;
}

module.exports = { bodyValidation };