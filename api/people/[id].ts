import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma.js";
import type { ApiErrorResponse, PersonDetailDTO, SceneDTO } from "../../shared/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" } satisfies ApiErrorResponse);
    return;
  }

  const id = Number(req.query.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "invalid_id" } satisfies ApiErrorResponse);
    return;
  }

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      scenes: {
        include: { people: true },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!person) {
    res.status(404).json({ error: "not_found" } satisfies ApiErrorResponse);
    return;
  }

  const scenes: SceneDTO[] = person.scenes.map((scene) => ({
    id: scene.id,
    date: scene.date.toISOString().slice(0, 10),
    title: scene.title,
    story: scene.story,
    people: scene.people.map((p) => ({ id: p.id, name: p.name })),
  }));

  const dto: PersonDetailDTO = { id: person.id, name: person.name, scenes };
  res.status(200).json(dto);
}
