import { NodeComponentProps } from "@initiative.dev/schema";
import { I18nSchema } from "./i18n.schema.js";

export function I18n({
  slots,
  OutputsProvider,
}: NodeComponentProps<I18nSchema>) {
  function translate(translationKey: string): string {
    return (
      translations[translationKey] ??
      `I18n error: translation key '${translationKey}' not found.`
    );
  }

  return (
    <OutputsProvider translate={translate}>
      <slots.child.Component />
    </OutputsProvider>
  );
}

const translations: Record<string, string> = {
  "scene-title": "Article Management",
  "new-article-button.label": "Add new",
  "table-headers.id-column": "Id",
  "table-headers.name-column": "Name",
};
