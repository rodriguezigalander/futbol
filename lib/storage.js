import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const KEY = 'futbol:votes'

export async function getVotes() {
  try {
    const votes = await redis.get(KEY)
    return votes || []
  } catch {
    return []
  }
}

export async function saveVote(vote) {
  const votes = await getVotes()
  const filtered = votes.filter(v => v.name.toLowerCase() !== vote.name.toLowerCase())
  filtered.push({ ...vote, timestamp: new Date().toISOString() })
  await redis.set(KEY, filtered)
  return filtered
}