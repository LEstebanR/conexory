import type { PrismaClient } from "@prisma/client"

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function generateAgentSlug(name: string, prisma: PrismaClient): Promise<string> {
  const base = nameToSlug(name)
  let slug = base
  let i = 2
  while (await prisma.user.findUnique({ where: { agentSlug: slug } })) {
    slug = `${base}-${i++}`
  }
  return slug
}

export async function ensureAgentSlug(
  userId: string,
  name: string,
  prisma: PrismaClient
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { agentSlug: true },
  })
  if (user?.agentSlug) return user.agentSlug
  const slug = await generateAgentSlug(name, prisma)
  await prisma.user.update({ where: { id: userId }, data: { agentSlug: slug } })
  return slug
}
