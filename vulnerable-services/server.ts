import * as express from 'express'

const app = express()

app.use(express.static(__dirname + '/../../vulnerable-services/public'))

const port = 8080
const hostname = process.env['HOSTNAME'] || '127.0.0.1'
app.listen(port, hostname, () =>
  console.log(`Vulnerable services listening on http://${hostname}:${port}`)
)
