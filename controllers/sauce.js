const Sauce = require('../models/Sauce')
const fs = require('fs');
const path = require('path')

exports.getSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }))
}

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}

exports.createSauce = (req, res, next) => {
  const sauceParse = JSON.parse(req.body.sauce)
  delete sauceParse.userId // Supprimer le  userId de la requête....
  const sauce = new Sauce({
    ...sauceParse,
    userId: req.auth.userId, // ...puis inserer l'Id auth dans la création de sauces pour plus de sécurité
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [], 
    usersDisliked: []
  })
  sauce.save()
  .then(()=> {
    res.status(201).json({ message: "Sauce saved !"})
  })
  .catch(error => res.status(400).json({ error }))

}

exports.modifySauce = (req, res, next) => { 

  let sauceObject = {}
  
  if (req.file != null) {
  /////////
  // Suppression de l'ancienne image dans le dossier 'images' (facultatif)
    Sauce.findOne({ _id: req.params.id }) 
    .then(sauce => { 
      const filename = sauce.imageUrl.split('/')[4] 
      const imagePath = path.resolve(`./images/${filename}`) 
      fs.unlink(imagePath, () => console.log('image modified => ( FROM', filename, 'TO', req.file.filename, ')'))
    })
  /////////

    sauceObject = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    }
  } else {
    sauceObject = {
      ...req.body,
    }
  }

  delete sauceObject.userId // Supprimer le userID par mesure de sécurité
  Sauce.findOne()
    .then(sauce => {
      if(sauce.userId !== req.auth.userId){
        res.status(403).json({ message: 'Unauthorized'})
      } else {  
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id:req.params.id})
        .then(() => res.status(200).json({ message: 'Sauce modified ! '}))
        .catch(error => res.status(400).json({ error }))
      }
    })
    .catch(err => res.status(400).json({ err }))
}

exports.deleteSauce = (req, res, next) => {

  /////////
  // Suppression de l'image dans le dossier 'images' (facultatif)
  Sauce.findOne({ _id: req.params.id }) 
    .then(sauce => {
      const filename = sauce.imageUrl.split('/')[4]
      const imagePath = path.resolve(`./images/${filename}`)
      fs.unlink(imagePath, () => console.log('image deleted : ', filename))
    }) 
  /////////

  Sauce.deleteOne({ _id: req.params.id })
    .then(() => {
      return res.status(200).json({ message: 'Hot sauce gone...' });
    })
    .catch(error => res.status(400).json({ error }))
  
}

exports.likeSauce = (req, res, next) => {
  const authId = req.auth.userId
  const likeReq = req.body.like
  console.log('like count : ', likeReq);  

  Sauce.findOne({ _id: req.params.id})
    .then(sauce => {
      let likesCount = sauce.likes // <===
      let userLiked = sauce.usersLiked
      let userDisliked = sauce.usersDisliked
      if(req.body.userId !== authId){
        res.status(403).json({ message: 'Unauthorized'})
      } else {        
        if(likeReq == 1){
          console.log('User liked this sauce');
          sauce.likes++
          userLiked.push(authId)
          Sauce.updateOne({ _id: req.params.id}, { likes: sauce.likes, usersLiked: userLiked })
            .then(() => res.status(200).json({ message: 'Sauce liked !'}))
            .catch(error => res.status(400).json({ error }))
        } else if (likeReq == 0){
          const findUserInLikes = userLiked.find(el => el == authId)
          const findUserInDislikes = userDisliked.find(el => el == authId)   
          if(findUserInLikes){
            sauce.likes--
            console.log("User back to 0 from 'liked' sauce")
            userLiked.splice(findUserInLikes, 1)
            Sauce.updateOne({ _id: req.params.id}, { likes: sauce.likes, usersLiked: userLiked })
              .then(() => res.status(200).json({ message: 'Sauce unliked'}))
              .catch(error => res.status(400).json({ error }))
          } else if (findUserInDislikes){
            console.log("User back to 0 from 'disliked' sauce")
            sauce.dislikes--
            userDisliked.splice(findUserInDislikes, 1)
            Sauce.updateOne({ _id: req.params.id}, { dislikes: sauce.dislikes, usersDisliked: userDisliked })
              .then(() => res.status(200).json({ message: 'Sauce unliked'}))
              .catch(error => res.status(400).json({ error }))
          }
        } else if (likeReq == -1) {
          console.log("User disliked this sauce")
          sauce.dislikes++
          userDisliked.push(authId)
          Sauce.updateOne({ _id: req.params.id}, { dislikes: sauce.dislikes, usersDisliked: userDisliked })
            .then(() => res.status(200).json({ message: 'Sauce disliked'}))
            .catch(error => res.status(400).json({ error }))
        } 
      }
    })
    .catch(error => res.status(400).json(error))
}

// ().deleteMany().then(console.log('deleted'))