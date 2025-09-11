module.exports = (req, res, next) => {
  req.tenantId = req.headers['x-tenant-id'] || null;
  next();
}; 