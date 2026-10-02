export const LIMITS = {
  TITLE_MAX: 100,
  NAME_MAX: 50,
  STORY_MAX: 2000,
} as const;

export const MESSAGES = {
  required: "この項目を入力してください。",
  maxLength: (max: number) => `${max}文字以内で入力してください。`,
};

export type SceneFieldErrors = {
  date?: string;
  title?: string;
  story?: string;
  people?: string;
};

export function validatePersonName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return MESSAGES.required;
  if (trimmed.length > LIMITS.NAME_MAX) return MESSAGES.maxLength(LIMITS.NAME_MAX);
  return null;
}

export function validateSceneInput(input: {
  date: string;
  title: string;
  story: string;
  peopleCount: number;
}): SceneFieldErrors {
  const errors: SceneFieldErrors = {};

  if (!input.date.trim()) {
    errors.date = MESSAGES.required;
  }

  const title = input.title.trim();
  if (!title) {
    errors.title = MESSAGES.required;
  } else if (title.length > LIMITS.TITLE_MAX) {
    errors.title = MESSAGES.maxLength(LIMITS.TITLE_MAX);
  }

  const story = input.story.trim();
  if (story.length > LIMITS.STORY_MAX) {
    errors.story = MESSAGES.maxLength(LIMITS.STORY_MAX);
  }

  if (input.peopleCount < 1) {
    errors.people = MESSAGES.required;
  }

  return errors;
}

export function hasSceneErrors(errors: SceneFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
