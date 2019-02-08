const express = require('express')
const bodyParser = require('body-parser')
const Datastore = require('@google-cloud/datastore');

const app = express()
app.enable('trust proxy')
app.use(bodyParser.json())
const datastore = Datastore()

app.post('/api/run', (req, res, next) => {
   const recordKey = datastore.key('Record');
   const entity = {
	key: recordKey,
 	data: {
		name: req.body.name,
 	 	firstname: req.body.firstname
		}
	}
 datastore.insert(entity)   
	 .then(() => {
     	 console.log(`Record ${recordId} created successfully.`);
   	 })
   	 .catch(err => {
     	 console.error('ERROR:', err);
   	 });
  res
    .status(200)
    .set('Content-Type', 'application/json')
    .send(req.body)
})

app.delete('/api/run/:run_id', (req, res, next) => {
  const run_ids = req.params.run_id.split(',').map(v => parseInt(v)).filter(v => !isNaN(v))
run_ids.forEach(runId => {
  	const recordKey = datastore.key(['Record', runId]);
  	datastore
    	.delete(recordKey)
    	.then(() => {
      	console.log(`Record ${runId} deleted successfully.`);
    		})
    	.catch(err => {
      		console.error('ERROR:', err);
    	});
})
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

app.post('/api/run/records', (req, res, next) => {
const entities = []
req.body.records.forEach( record => {
record.timeStamp = Date.now()
const recordKey = datastore.key("Record")
entities.push(({key: recordKey, 
data: record}))})
  datastore.upsert(entities).then(() => {console.log("done")})  
res
    .status(200)
    .set('Content-Type', 'application/json')
    .send(req.body.records)
})

app.get('/api/run/:userName', (req, res, next) => {
 const userName = req.params.userName
 const query = datastore
			.createQuery('Record')
			.filter('userName', '=', userName);
 datastore.runQuery(query)
                        .then(results => {
					const records = results[0]
					const record = records[0]
					const timeS = records[0].timeStamp
					//const date = timeS.getDate()
					//const date = Date.prototype.getTime()
					//console.log("date: " , date)
					res
  					   .status(200)
  					   .set('Content-Type', 'application/json')
  					   .send(record)
}) 
                        .catch(err => {console.error('ERROR:', err)})

})

app.get('/api/run/:userName/:position', (req, res, next) => {
 const userName = req.params.userName
 const position = req.params.position
 const query = datastore
                        .createQuery('Record')
			.filter('userName', '=', userName)
			.filter('position', '=', position)
 
 datastore.runQuery(query)
                        .then(results => {
                                        const records = results[0]
					const record = records[0]
                                        const timeS = record.timeStamp
					res
  					   .status(200)
   					   .set('Content-Type', 'application/json')
  					   .send(record) })
 
                        .catch(err => {console.error('ERROR:', err)})
})

app.get('/api/run/:timeStamps', (req, res, next) => {
 const timeStamps = req.params.timeStamps.split(',').map(v => parseInt(v)).filter(v => !isNaN(v))
 const timeStampMin = 0
 const timeStampMax = 0
/*
//console.log(timeStamp[0])
  if(timeStamps[0] >= timeStamps[1]) {
	timeStampMax = timeStamp[0]
	timeStampMin = timeStamp[1]
}else {
	timeStampMax = timeStamp[1]
        timeStampMin = timeStamp[0]
}
 
const query = datastore
                        .createQuery('Record')
                        .filter('timeStamp', '>', timeStampMin)
                        .filter('timeStamp', '<', timeStampMax)

 datastore.runQuery(query)
                        .then(results => {
                                        const records = results[0]*/
                                        res
                                           .status(200)
                                           .set('Content-Type', 'application/json')
                                           .send(records)/*})
 
                        .catch(err => {console.error('ERROR:', err)})
*/
})
