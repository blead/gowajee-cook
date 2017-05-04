const express = require('express')
const path = require('path')

const PORT = 80
const LOG = false

var app = express()

app.use((req, res, next) => {
  if (LOG) { console.log(req.url) }
  next()
})

app.use(express.static(path.join(__dirname, 'src')))

app.use((req, res, next) => {
  res.status(404).send('Not Found')
})

app.listen(PORT, () => {
  console.log('server started, listening on port ' + PORT)
})
