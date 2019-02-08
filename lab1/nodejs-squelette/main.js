const express = require('express')
const bodyParser = require('body-parser')
const Datastore = require('@google-cloud/datastore');

const app = express()
app.enable('trust proxy')
app.use(bodyParser.json())
const datastore = Datastore()

app.delete('/api/run/:ids', (req, res, next) => {
	if (typeof req.params.ids !== 'undefined') {
		const ids = req.params.ids.split(',').map(v => parseInt(v)).filter(v => !isNaN(v))
		ids.forEach(id => {
			const query = lookUpById(id)
			datastore.runQuery(query)
				.then(results => {
					const records = results[0]
					records.forEach(record => {
						console.log("key ", record[datastore.KEY])
						const recordKey = record[datastore.KEY];
						datastore
							.delete(recordKey)
							.then(() => {
								console.log(`Record ${id} deleted successfully.`);
							})
							.catch(err => {
								console.error('ERROR:', err);
							});
					})
				})

				.catch(err => { console.error('ERROR:', err) })
		})
	}

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

app.post('/api/run', (req, res, next) => {
	const entities = []
	req.body.data.forEach(record => {
		record.timestamp = Date.now()
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

app.get('/api/run', (req, res, next) => {
	var timeStamps
	const userName = req.query.user
	const lat = req.query.lat
	const long = req.query.long
	var position
	if (typeof long !== 'undefined' && typeof lat !== 'undefined') {
		position = { long: long, lat: lat }
	}
	var query
	var timeStampMin
	var timeStampMax
	if (typeof req.query.timestamp !== 'undefined') {
		timeStamps = req.query.timestamp.split(',').map(v => parseInt(v)).filter(v => !isNaN(v))
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
				query = lookUpByNameTime(userName, timeStampMin, timeStampMax)
			}
		} else {
			query = lookUpByTime(timeStampMin, timeStampMax)
		}
	} else {
		if (typeof userName !== 'undefined') {
			if (typeof position !== 'undefined') {
				query = lookUpByNamePos(userName, position)
			} else {
				query = lookUpByName(userName)
			}
		} else if (typeof position !== 'undefined') {
			query = lookUpByPos(position)
		} else {
			query = getall()
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
		.filter('user', '=', userName)
		.filter('timestamp', '>=', timeStampMin)
		.filter('timestamp', '<=', timeStampMax)
		.filter('long', '=', position.long)
		.filter('lat', '=', position.lat)

	return query
}

function lookUpByNamePos(userName, position) {
	const query = datastore
		.createQuery('Record')
		.filter('user', '=', userName)
		.filter('long', '=', position.long)
		.filter('lat', '=', position.lat)
	return query
}

function lookUpByNameTime(userName, timeStampMin, timeStampMax) {

	const query = datastore
		.createQuery('Record')
		.filter('user', '=', userName)
		.filter('timestamp', '>=', timeStampMin)
		.filter('timestamp', '<=', timeStampMax)
	console.log(query)
	return query;
}

function lookUpByPosTime(position, timeStampMin, timeStampMax) {
	const query = datastore
		.createQuery('Record')
		.filter('timestamp', '>=', timeStampMin)
		.filter('timestamp', '<=', timeStampMax)
		.filter('long', '=', position.long)
		.filter('lat', '=', position.lat)
	return query
}

function lookUpByName(userName) {
	const query = datastore
		.createQuery('Record')
		.filter('user', '=', userName)

	return query;
}

function lookUpByTime(timeStampMin, timeStampMax) {
	const query = datastore
		.createQuery('Record')
		.filter('timestamp', '>=', timeStampMin)
		.filter('timestamp', '<=', timeStampMax)

	return query

}

function lookUpByPos(position) {
	const query = datastore
		.createQuery('Record')
		.filter('long', '=', position.long)
		.filter('lat', '=', position.lat)
	return query
}

function lookUpById(id) {
	const query = datastore
		.createQuery('Record')
		.filter('id', '=', id)

	return query
}

function getall() {
	const query = datastore
		.createQuery('Record')

	return query
}
