const jwt = require('jsonwebtoken')
const JWT_TOKEN = process.env.JWT_TOKEN
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, JWT_TOKEN);
    req.auth = {
      userId: decodedToken.userId
    }

    if (req.body.userId && req.body.userId !== req.auth.userId) {
      res.status(403).json({ message: 'Unauthorized request'})
    } else {
      next();
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}