const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_TOKEN = process.env.JWT_TOKEN

exports.signup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  bcrypt.hash(password, 10)
    .then(hash => {
      const user = new User({
        email,
        password: hash
      })
      user.save()
        .then(() => {
          console.log('user :' + user)
          return res.status(201).json({ message: 'Utilisateur crée' })
        })
        .catch(error => res.status(400).json({ error }))
      })
    .catch(error => res.status(500).json({error}))
  }

exports.login = (req, res, next) => {

  User.findOne({ email: req.body.email })
    .then(user => {
      if(user === null){
        res.status(403).json({ message: 'Identifiant/MDP incorrect'})
      } else {
        bcrypt.compare(req.body.password, user.password)
          .then(mdp => {
            if(!mdp){
              res.status(403).json({ message: 'Identifiant/MDP inccorect'})
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  { userId: user._id },
                  JWT_TOKEN,
                  { expiresIn : '24h' }
                )
              })
            }
          })
          .catch(error => res.status(500).json({ error }))
      }
    })
    .catch(error => res.status(500).json({error}))
}
