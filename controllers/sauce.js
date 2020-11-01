const Sauce = require('../models/sauce');
const fs = require('fs');

// Create a sauce with the data from the request, upload image on the host, initialize likes and dislikes
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save().then(
    () => {
      res.status(201).json({
        message: 'Sauce saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// Retrieve a sauce based on its id and return it in a json
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

// Update sauce info with datas from the request
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
};

// Delete a sauce based on its id
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // Delete image
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// Find any sauces and return them in a json
exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// Likes and Dislikes feature
exports.modifyLikeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    switch(req.body.like) {
      // Dislike
      case -1: 
        // a dislike will add the userId to the usersDisliked array
        if(sauce.usersDisliked.indexOf(req.body.userId) === -1){
          sauce.usersDisliked.push(req.body.userId);
        } else {
          // or will remove a previous dislike in case it already exists
          sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId), 1);
        }
        break;
        // Like
      case 1:
        // a like will add the userId to the usersLiked array
        if(sauce.usersLiked.indexOf(req.body.userId) === -1){
          sauce.usersLiked.push(req.body.userId);
        } else {
          // or will remove a previous like in case it already exists
          sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
        }
        break;
        // No like or dislike
      case 0:
        if(sauce.usersLiked.indexOf(req.body.userId) > -1){
          sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
        }else if(sauce.usersDisliked.indexOf(req.body.userId) > -1){
          sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId), 1); 
        }
        break;
    }

    // Update counter values for likes and dislikes
    sauce.likes = sauce.usersLiked.length;
    sauce.dislikes = sauce.usersDisliked.length;

    // Send datas to DB
    sauce.save().then(
      () => {
        res.status(201).json({
          message: 'Likes updated successfully!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
   })  
};