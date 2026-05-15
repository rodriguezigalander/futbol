import { getVotes, saveVote } from '../../../lib/storage'

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
