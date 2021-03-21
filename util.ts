import { createHash } from 'crypto'

export function md5Hex(input: string): string {
  return createHash('md5').update(input).digest('hex')
}
