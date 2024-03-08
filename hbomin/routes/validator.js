const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bodyValidation(req, res) {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({ error: 'Invalid data, body data should be present' });
    return false;
  }
  return true;
}

function emailValidation(res, email) {
  if (!emailPattern.test(email)) {
    res.status(400).send({ error: 'Invalid data, email is not valid' });
    return false;
  }
  return true;
}

function dataValidation(res, data, type) {
  if (type === 'string' && !isString(data)) {
    res.status(400).send({ error: 'Invalid data, data should be a string' });
    return false;
  }
  if (type === 'number' && !isNumber(data)) {
    res.status(400).send({ error: 'Invalid data, data should be a number' });
    return false;
  }
  if (type === 'boolean' && !isBoolean(data)) {
    res.status(400).send({ error: 'Invalid data, data should be a boolean' });
    return false;
  }
  if (type === 'array' && !isArray(data)) {
    res.status(400).send({ error: 'Invalid data, data should be an array' });
    return false;
  }
  if (type === 'object' && !isObject(data)) {
    res.status(400).send({ error: 'Invalid data, data should be an object' });
    return false;
  }
  if (isNull(data) || isUndefined(data)) {
    res.status(400).send({ error: 'Invalid data, the given data is empty' });
    return false;
  }
  return true;
}

function rangeValidation(res, data, min, max) {
  if (data < min || data > max) {
    res.status(400).send({ error: 'Invalid data, data is not within a valid range' });
    return false;
  }
  return true;
}

function unsignedValidation(res, data) {
  if (data < 0) {
    res.status(400).send({ error: 'Invalid data, data should be an unsigned number' });
    return false;
  }
  return true;
}

function isNull(input) {
  return input === null;
}

function isUndefined(input) {
  return typeof input === 'undefined';
}

function isString(input) {
  return !isNull(input) && !isUndefined(input) && typeof input === 'string';
}

function isNumber(input) {
  return !isNull(input) && !isUndefined(input) && typeof input === 'number' && !isNaN(input);
}

function isBoolean(input) {
  return !isNull(input) && !isUndefined(input) && typeof input === 'boolean';
}

function isArray(input) {
  return !isNull(input) && !isUndefined(input) && Array.isArray(input);
}

function isObject(input) {
  return !isNull(input) && !isUndefined(input) && typeof input === 'object' && input !== null && !Array.isArray(input);
}

module.exports = { bodyValidation, emailValidation, dataValidation, rangeValidation, unsignedValidation, isNumber };