const express = require('express')
const bodyParser = require('body-parser')
const Datastore = require('@google-cloud/datastore');

const app = express()
app.enable('trust proxy')
app.use(bodyParser.json())
const datastore = Datastore()

app.get('/api/run', (req, res, next) => {
  console.log(req.query)
  res
    .status(200)
    .set('Content-Type', 'application/json')
    .send({hello: "world"})
})

app.post('/api/run', (req, res, next) => {
  console.log(req.body)
  res
    .status(200)
    .set('Content-Type', 'application/json')
    .send({hello: "world"})
})

app.delete('/api/run/:run_id', (req, res, next) => {
  const run_ids = req.params.run_id.split(',').map(v => parseInt(v)).filter(v => !isNaN(v))
  console.log(run_ids)
  res
    .status(200)
    .set('Content-Type', 'application/json')
    .send({hello: "world"})
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
})
