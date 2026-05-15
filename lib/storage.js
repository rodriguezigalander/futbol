import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'votes.json')

async function ensureFile() {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    try {
      await fs.access(DATA_FILE)
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([]))
    }
  } catch {}
}

export async function getVotes() {
  try {
    await ensureFile()
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function saveVote(vote) {
  const votes = await getVotes()
  // Remove previous vote from same player (by name)
  const filtered = votes.filter(v => v.name.toLowerCase() !== vote.name.toLowerCase())
  filtered.push({ ...vote, timestamp: new Date().toISOString() })
  await ensureFile()
  await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2))
  return filtered
}
