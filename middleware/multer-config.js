const multer = require('multer')

const MIME = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_')
    const extension = MIME[file.mimetype]
    callback(null, name + Date.now() + '.' + extension)
  }
})

module.exports = multer({ storage: storage }).single('image')

