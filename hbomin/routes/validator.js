function bodyValidation(req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({ error: 'Invalid data, body data should be present' });
    return false;
  }
  return true;
}

module.exports = { bodyValidation };