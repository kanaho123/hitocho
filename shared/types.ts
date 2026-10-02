export type PersonDTO = {
  id: number;
  name: string;
};

export type PersonListItemDTO = PersonDTO & {
  sceneCount: number;
};

export type SceneDTO = {
  id: number;
  date: string; // "YYYY-MM-DD"
  title: string;
  story: string | null;
  people: PersonDTO[];
};

export type PersonDetailDTO = {
  id: number;
  name: string;
  scenes: SceneDTO[];
};

export type CreateSceneInput = {
  date: string; // "YYYY-MM-DD"
  title: string;
  story: string;
  personIds: number[];
  newPersonNames: string[];
};

export type ConfigDTO = {
  readOnly: boolean;
};

export type FieldErrors = Record<string, string>;

export type ApiErrorResponse = {
  error: string;
  fields?: FieldErrors;
};
