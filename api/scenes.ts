import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Prisma } from "@prisma/client";
import { prisma } from "./_lib/prisma.js";
import { validatePersonName, validateSceneInput } from "../shared/validation.js";
import type {
  ApiErrorResponse,
  CreateSceneInput,
  SceneDTO,
} from "../shared/types.js";

type SceneWithPeople = Prisma.SceneGetPayload<{ include: { people: true } }>;

function toSceneDTO(scene: SceneWithPeople): SceneDTO {
  return {
    id: scene.id,
    date: scene.date.toISOString().slice(0, 10),
    title: scene.title,
    story: scene.story,
    people: scene.people.map((p) => ({ id: p.id, name: p.name })),
  };
}

async function handleGet(res: VercelResponse) {
  const scenes = await prisma.scene.findMany({
    include: { people: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  res.status(200).json(scenes.map(toSceneDTO));
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const body = req.body as Partial<CreateSceneInput> | undefined;

  const date = typeof body?.date === "string" ? body.date : "";
  const title = typeof body?.title === "string" ? body.title : "";
  const story = typeof body?.story === "string" ? body.story : "";
  const personIds = Array.isArray(body?.personIds)
    ? body.personIds.filter((id): id is number => typeof id === "number")
    : [];
  const newPersonNames = Array.isArray(body?.newPersonNames)
    ? body.newPersonNames.filter((n): n is string => typeof n === "string")
    : [];

  const fields = validateSceneInput({
    date,
    title,
    story,
    peopleCount: personIds.length + newPersonNames.length,
  });

  for (const name of newPersonNames) {
    const error = validatePersonName(name);
    if (error) {
      fields.people = error;
      break;
    }
  }

  if (Object.keys(fields).length > 0) {
    const errorBody: ApiErrorResponse = { error: "validation_failed", fields };
    res.status(400).json(errorBody);
    return;
  }

  const scene = await prisma.scene.create({
    data: {
      date: new Date(date),
      title: title.trim(),
      story: story.trim() || null,
      people: {
        connect: personIds.map((id) => ({ id })),
        create: newPersonNames.map((name) => ({ name: name.trim() })),
      },
    },
    include: { people: true },
  });

  res.status(201).json(toSceneDTO(scene));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    await handleGet(res);
    return;
  }
  if (req.method === "POST") {
    await handlePost(req, res);
    return;
  }
  res.status(405).json({ error: "method_not_allowed" } satisfies ApiErrorResponse);
}
