module.exports = (permission) => {
  return (req, res, next) => {
    if (req.user && req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }
    return res.status(403).json({ message: 'FORBIDDEN' });
  };
}; 