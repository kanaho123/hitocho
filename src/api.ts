import type {
  ApiErrorResponse,
  CreateSceneInput,
  PersonDetailDTO,
  PersonListItemDTO,
  SceneDTO,
} from "../shared/types";

export class ApiError extends Error {
  fields?: Record<string, string>;

  constructor(body: ApiErrorResponse) {
    super(body.error);
    this.fields = body.fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json()) as ApiErrorResponse;
    throw new ApiError(body);
  }
  return res.json() as Promise<T>;
}

export function getScenes(): Promise<SceneDTO[]> {
  return request("/api/scenes");
}

export function createScene(input: CreateSceneInput): Promise<SceneDTO> {
  return request("/api/scenes", { method: "POST", body: JSON.stringify(input) });
}

export function getPeople(): Promise<PersonListItemDTO[]> {
  return request("/api/people");
}

export function getPerson(id: number): Promise<PersonDetailDTO> {
  return request(`/api/people/${id}`);
}
