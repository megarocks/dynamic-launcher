const fs = require('fs')

fs.readdir('./logo', (err, files) => {
  files.forEach(fileName => {
    fs.renameSync('./logo/' + fileName, './logo/' + fileName.replace(' ', '-').toLowerCase().trim())
  })
})
