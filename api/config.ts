import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isReadOnlyDemo } from "./_lib/env.js";
import type { ApiErrorResponse, ConfigDTO } from "../shared/types.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "method_not_allowed" } satisfies ApiErrorResponse);
    return;
  }

  const dto: ConfigDTO = { readOnly: isReadOnlyDemo() };
  res.status(200).json(dto);
}
