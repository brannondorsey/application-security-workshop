import * as express from 'express'
import { Request, Response } from 'express'
import { urlencoded } from 'body-parser'
import * as cookieParser from 'cookie-parser'
import { readdir, writeFile } from 'fs/promises'
import { md5Hex } from '../util'

const COOKIE_SECRET = '295C7B93-3CD8-4366-9BD9-109468A33218'
const CREDENTIALS_DIR = __dirname + '/../../vulnerable-services/credentials'
const STATIC_DIR = __dirname + '/../../vulnerable-services/static'

const app = express()
app.use(urlencoded())
app.use(cookieParser(COOKIE_SECRET))

app.use('/private', (req, res, next) => {
  const valid = loginCookieIsValid(req)
  if (!valid) res.status(403).send('Forbidden')
  next()
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const success = await validateLoginCredentials(username, password)
  if (success) {
    setLoginCookie(res)
    res.redirect('/private')
  } else {
    res.redirect('/?loginError=true')
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  await registerCredentials(username, password)
  setLoginCookie(res)
  res.redirect('/private')
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

function setLoginCookie(res: Response) {
  res.cookie('authToken', 'valid', { signed: true })
}

function loginCookieIsValid(req: Request): boolean {
  const signedCookies = req.signedCookies
  return signedCookies['authToken'] === 'valid'
}
