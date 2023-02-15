require("dotenv").config()
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const multer = require("multer")
const upload = multer()
const baseRouter = require("./router")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(upload.array())
app.use(express.static('public'))
require("./setup/init")().then(() => {
  app.use('/', baseRouter)
  
  app.listen(port, () => console.log(`Omphalos backend listening on port ${port}!`));
}).catch((reason) => {
  console.error(reason)
})
