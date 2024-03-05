function bodyValidation(req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    console.error("Invalid data");
    res.status(400).send({ error: 'Invalid data' });
    return false;
  }
  return true;
}

module.exports = { bodyValidation };