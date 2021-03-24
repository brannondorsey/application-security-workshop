import express from 'express'
import { Request, Response, Express } from 'express'
import { urlencoded } from 'body-parser'
import cookieParser from 'cookie-parser'
import morganBody from 'morgan-body'
import { readdir, writeFile, readFile, access } from 'fs/promises'
import { createWriteStream } from 'fs'
import { md5Hex } from '../util'
import { exec } from 'child_process'
import path from 'path'

const COOKIE_SECRET = '295C7B93-3CD8-4366-9BD9-109468A33218'
const CREDENTIALS_DIR = __dirname + '/../../vulnerable-services/credentials'
const HISTORY_DIR = __dirname + '/../../vulnerable-services/history'
const STATIC_DIR = __dirname + '/../../vulnerable-services/static'
const LOG_FILE = __dirname + '/../../vulnerable-services/requests.log'

const app = express()
app.use(cookieParser(COOKIE_SECRET))
app.use(urlencoded())
configureLogging(app)

app.use('/private', (req, res, next) => {
  const valid = loginCookieIsValid(req)
  if (!valid) res.status(403).send('Forbidden')
  next()
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const success = await validateLoginCredentials(username, password)
  if (success) {
    setLoginCookie(username, res)
    res.redirect('/private')
  } else {
    res.redirect('/?loginError=true')
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  await registerCredentials(username, password)
  setLoginCookie(username, res)
  res.redirect('/private')
})

app.post('/save-result', async (req, res) => {
  const result = req.body.result
  if (result) {
    await saveResult(result)
    res.status(204).send()
  } else {
    res.status(400).send('No result sent')
  }
})

app.get('/result-history', async (_, res) => {
  res.json({ results: await loadResults() })
})

app.get('/extract-frame', async (req, res) => {
  const { videoUrl, frameSeconds } = req.query
  try {
    const frame = await extractFrame(
      videoUrl as string,
      parseInt(frameSeconds as string)
    )
    res.contentType('image/jpeg').send(frame)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal server error')
  }
})

app.use(express.static(STATIC_DIR))

const port = 8080
const hostname = process.env['HOSTNAME'] || '127.0.0.1'
app.listen(port, hostname, () =>
  console.log(`Vulnerable services listening on http://${hostname}:${port}`)
)

async function registerCredentials(
  username: string,
  password: string
): Promise<void> {
  const credentials = md5Hex(`${username}:${password}`)
  await writeFile(`${CREDENTIALS_DIR}/${credentials}`, '')
}

async function validateLoginCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (!username || !password) return false
  const match = md5Hex(`${username}:${password}`)
  const candidates = await readdir(CREDENTIALS_DIR)
  return candidates.includes(match)
}

function setLoginCookie(username: string, res: Response) {
  res.cookie('authToken', username, { signed: true })
}

function loginCookieIsValid(req: Request): boolean {
  const username = req.signedCookies['authToken']
  return typeof username === 'string' && username.length > 0
}

async function saveResult(result: string) {
  const millis = new Date().getTime()
  const filename = `${HISTORY_DIR}/${millis}`
  await writeFile(filename, result)
}

async function loadResults(): Promise<string[]> {
  const basenames = await readdir(HISTORY_DIR)
  const filenames = basenames.map((basename) => `${HISTORY_DIR}/${basename}`)
  filenames.sort()
  const buffers = await Promise.all(
    filenames.map((filename) => readFile(filename))
  )
  return buffers.map((buffer) => buffer.toString()).filter((str) => str != '')
}

function configureLogging(app: Express) {
  if (process.env['DEBUG'] === '1') {
    console.log(`DEBUG=1, logging requests to ${LOG_FILE}`)
    const log = createWriteStream(LOG_FILE, { flags: 'a' })
    morganBody(app, {
      noColors: true,
      stream: log,
    })
  }
}

async function extractFrame(
  videoUrl: string,
  frameSeconds: number
): Promise<Buffer> {
  const filename = await downloadFile(videoUrl)
  const { stdout } = await runCommand(
    `ffmpeg -ss ${frameSeconds} -i ${filename} -frames:v 1 -f mjpeg -`
  )
  return stdout
}

async function downloadFile(url: string): Promise<string> {
  const filename = path.join('/tmp', md5Hex(url))
  try {
    await access(filename)
  } catch {
    await runCommand(`wget -L -O ${filename} ${url}`)
  }
  return filename
}

async function runCommand(
  command: string
): Promise<{ stdout: Buffer; stderr: Buffer }> {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { encoding: 'buffer', shell: '/bin/bash' },
      (err, stdout: Buffer, stderr: Buffer) => {
        if (err) reject(err)
        resolve({ stdout, stderr })
      }
    )
  })
}
