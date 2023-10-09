import { ArticleManagement } from "#initiative/scenes/article-management/scene.js";
import { LocaleProvider } from "#initiative/scenes/locale-context.js";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.querySelector("#root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);

function App() {
  const [locale, setLocale] = useState<"de" | "en">("en");
  return (
    <LocaleProvider locale={locale}>
      <select
        value={locale}
        onChange={(e) => setLocale(e.currentTarget.value as "de" | "en")}
      >
        <option value="en">en</option>
        <option value="de">de</option>
      </select>

      <ArticleManagement />
    </LocaleProvider>
  );
}
