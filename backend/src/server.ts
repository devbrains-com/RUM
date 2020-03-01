import express from 'express'
import cors from 'cors'
import { parseBeacon } from './beaconParser'

const app = express()
app.use(
  cors({
    origin: 'http://wsmichi:3000'
  })
)
app.use(express.json())
app.use(express.text())

app.post('/beacon', (req, res) => {
  console.log('request', req)
  const beacon = JSON.parse(req.body)
  console.log('body', beacon)

  const data = parseBeacon(beacon)

  console.log('data', data)

  res.status(201)
  res.send()
})

app.listen(3001, () => 'listen on port 3001')

const sleep = time => {
  var now = new Date().getTime()

  while (new Date().getTime() < now + time) {
    /* do nothing; this will exit once it reached the time limit */
    /* if you want you could do something and exit*/
    /* mostly I prefer to use this */
  }
}
