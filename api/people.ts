import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "./_lib/prisma.js";
import type { ApiErrorResponse, PersonListItemDTO } from "../shared/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" } satisfies ApiErrorResponse);
    return;
  }

  const people = await prisma.person.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { scenes: true } } },
  });

  const dto: PersonListItemDTO[] = people.map((p) => ({
    id: p.id,
    name: p.name,
    sceneCount: p._count.scenes,
  }));

  res.status(200).json(dto);
}
