import type { ArticleSource, ArticleSourceInput } from "@/entities/articles";

export type ArticleSourceFormState = {
  id?: number;
  name: string;
  url: string;
  enabled: boolean;
  displayOrder: number;
};

export function createEmptyArticleSourceFormState(): ArticleSourceFormState {
  return {
    name: "",
    url: "",
    enabled: true,
    displayOrder: 0,
  };
}

export function articleSourceToFormState(source: ArticleSource): ArticleSourceFormState {
  return {
    id: source.id,
    name: source.name,
    url: source.url,
    enabled: source.enabled,
    displayOrder: source.displayOrder,
  };
}

export function formStateToArticleSourceInput(
  formState: ArticleSourceFormState
): ArticleSourceInput {
  return {
    name: formState.name,
    url: formState.url,
    enabled: Boolean(formState.enabled),
    displayOrder: Number.isFinite(formState.displayOrder)
      ? formState.displayOrder
      : 0,
  };
}
