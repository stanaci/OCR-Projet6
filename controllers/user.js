const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const emailValidator = require("email-validator");

let passwordValidator = require('password-validator');
 
// Create a schema
let schemaPwd = new passwordValidator();
 
// Add properties to it
schemaPwd
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

// Signup feature
exports.signup = (req, res, next) => {
  if(schemaPwd.validate(req.body.password)){
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  }
else {
  return res.status(401).json({ error: 'Format mot de passe invalide ! Choisir un mot de passe de 8 caractères minimum, contenant au moins une majuscule, une minuscule, 2 chiffres' });
}
}
  

  // Login feature
exports.login = (req, res, next) => {
  if (emailValidator.validate(req.body.email)){
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.TOKEN,
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
  } 
  else{
    return res.status(401).json({ error: 'Format email invalide !' });
  }
};