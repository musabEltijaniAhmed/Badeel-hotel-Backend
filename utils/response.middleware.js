module.exports = (req, res, next) => {
  res.success = (data = null, message = 'OK', status = 200) => {
    return res.status(status).json({ status: true, message, data });
  };

  res.fail = (message = 'ERROR', errors = null, status = 400) => {
    return res.status(status).json({ status: false, message, errors });
  };

  next();
};