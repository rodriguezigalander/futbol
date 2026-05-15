import { getVotes, saveVote } from '../../../lib/storage'
import { Redis } from '@upstash/redis'

export async function GET() {
  const votes = await getVotes()
  return Response.json(votes)
}

export async function POST(request) {
  const body = await request.json()
  const { name, slots, observations } = body
  if (!name || !slots || !Array.isArray(slots)) {
    return Response.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const vote = { name: name.trim(), slots, observations: observations?.trim() || '' }
  await saveVote(vote)
  return Response.json({ ok: true })
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  if (!name) return Response.json({ error: 'Falta el nombre' }, { status: 400 })
  const votes = await getVotes()
  const filtered = votes.filter(v => v.name.toLowerCase() !== name.toLowerCase())
  const redis = Redis.fromEnv()
  await redis.set('futbol:votes', filtered)
  return Response.json({ ok: true })
}