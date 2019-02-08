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
		.send({ hello: "world" })
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
	console.log('Press Ctrl+C to quit.');
})

app.post('/api/run/records', (req, res, next) => {
	const entities = []
	req.body.records.forEach(record => {
		record.timeStamp = Date.now()
		const recordKey = datastore.key("Record")
		entities.push(({
			key: recordKey,
			data: record
		}))
	})
	datastore.upsert(entities).then(() => { console.log("done") })
	res
		.status(200)
		.set('Content-Type', 'application/json')
		.send(req.body.records)
})

// app.get('/api/run', (req, res, next) => {
// 	const userName = req.query.userName
// 	const query = lookUpByName(userName);
// 	datastore.runQuery(query)
// 		.then(results => {
// 			const records = results[0]
// 			res
// 				.status(200)
// 				.set('Content-Type', 'application/json')
// 				.send(records)
// 		})
// 		.catch(err => { console.error('ERROR:', err) })

// })

// app.get('/api/run', (req, res, next) => {
// 	const userName = req.query.userName
// 	const position = req.query.position

// 	datastore.runQuery(query)
// 		.then(results => {
// 			const records = results[0]
// 			res
// 				.status(200)
// 				.set('Content-Type', 'application/json')
// 				.send(records)
// 		})

// 		.catch(err => { console.error('ERROR:', err) })
// })

app.get('/api/run', (req, res, next) => {
	var timeStamps
	const userName = req.query.userName
	const position = req.query.position
	var query
	var timeStampMin
	var timeStampMax
	if (typeof req.query.timeStamps !== 'undefined') {
		timeStamps = req.query.timeStamps.split(',').map(v => parseInt(v)).filter(v => !isNaN(v))
		if (timeStamps[0] >= timeStamps[1]) {
			timeStampMax = timeStamps[0]
			timeStampMin = timeStamps[1]
		} else {
			timeStampMax = timeStamps[1]
			timeStampMin = timeStamps[0]
		}
		if (typeof userName !== 'undefined') {
			if (typeof position !== 'undefined') {
				query = lookUpByNamePosTime(userName, position, timeStampMin, timeStampMax)
			} else {
				lookUpByNameTime(userName, timeStampMin, timeStampMax)
			}
		} else {
			lookUpByTime(timeStampMin, timeStampMax)
		}
	} else {
		if (typeof userName !== 'undefined') {
			if (typeof position !== 'undefined') {
				query = lookUpByNamePos(userName, position)
			} else {
				lookUpByName(userName)
			}
		} else if (typeof position !== 'undefined') {
			query = lookUpByPos(position)
		}
	}

	datastore.runQuery(query)
		.then(results => {
			const records = results[0]
			res
				.status(200)
				.set('Content-Type', 'application/json')
				.send(records)
		})

		.catch(err => { console.error('ERROR:', err) })

})

function lookUpByNamePosTime(userName, position, timeStampMin, timeStampMax) {
	const query = datastore
		.createQuery('Record')
		.filter('userName', '=', userName)
		.filter('timeStamp', '>', timeStampMin)
		.filter('timeStamp', '<', timeStampMax)
		.filter('position', '=', position)

	return query
}

function lookUpByNamePos(userName, position) {
	const query = datastore
		.createQuery('Record')
		.filter('userName', '=', userName)
		.filter('position', '=', position)

	return query
}

function lookUpByNameTime(userName, timeStampMin, timeStampMax) {
	const query = datastore
		.createQuery('Record')
		.filter('userName', '=', userName)
		.filter('timeStamp', '>', timeStampMin)
		.filter('timeStamp', '<', timeStampMax)

	return query;
}

function lookUpByPosTime(position, timeStampMin, timeStampMax) {
	const query = datastore
		.createQuery('Record')
		.filter('timeStamp', '>', timeStampMin)
		.filter('timeStamp', '<', timeStampMax)
		.filter('position', '=', position)

	return query
}

function lookUpByName(userName) {
	const query = datastore
		.createQuery('Record')
		.filter('userName', '=', userName)

	return query;
}

function lookUpByTime(timeStampMin, timeStampMax) {
	const query = datastore
		.createQuery('Record')
		.filter('timeStamp', '>', timeStampMin)
		.filter('timeStamp', '<', timeStampMax)

	return query

}

function lookUpByPos(position) {
	const query = datastore
		.createQuery('Record')
		.filter('position', '=', position)

	return query
}
