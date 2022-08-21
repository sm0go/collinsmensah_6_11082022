const mongoose = require('mongoose')

const MDB_ID = process.env.MDB_ID
const MDB_PASSWORD = process.env.MDB_PASSWORD

mongoose.connect(`mongodb+srv://${MDB_ID}:${MDB_PASSWORD}@cluster0.qrwl0v6.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

module.exports = mongoose
  