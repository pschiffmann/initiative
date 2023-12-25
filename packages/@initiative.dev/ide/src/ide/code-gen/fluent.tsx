import {
  Expression,
  FluentMessageExpression,
  MemberAccessExpression,
  SceneDocument,
  fluentHelpers,
} from "#shared";
import { dedent } from "@pschiffmann/std/dedent";
import * as $String from "@pschiffmann/std/string";
import { NameResolver } from "./name-resolver.js";

export function generateFtlSceneSupport(
  locales: readonly string[],
  nameResolver: NameResolver,
) {
  const createContext = nameResolver.importBinding({
    moduleName: "react",
    exportName: "createContext",
  });
  const useEffect = nameResolver.importBinding({
    moduleName: "react",
    exportName: "useEffect",
  });
  const useState = nameResolver.importBinding({
    moduleName: "react",
    exportName: "useState",
  });
  const ReactNode = nameResolver.importType({
    moduleName: "react",
    exportName: "ReactNode",
  });

  const FluentBundle = nameResolver.importBinding({
    moduleName: "@fluent/bundle",
    exportName: "FluentBundle",
  });
  const FluentResource = nameResolver.importBinding({
    moduleName: "@fluent/bundle",
    exportName: "FluentResource",
  });
  const FluentVariable = nameResolver.importType({
    moduleName: "@fluent/bundle",
    exportName: "FluentVariable",
  });

  const useLocale = nameResolver.importBinding({
    moduleName: "../../locale-context.js",
    exportName: "useLocale",
  });

  const ftlCache = nameResolver.declareName("ftlCache");
  const translateMessage = nameResolver.declareName("translateMessage");
  const FluentBundleContext = nameResolver.declareName("FluentBundleContext");
  const FluentBundleProvider = nameResolver.declareName("FluentBundleProvider");

  return dedent`
    //
    // Fluent
    //

    const ${ftlCache} = new Map<string, Promise<string>>();

    const ${FluentBundleContext} = ${createContext}<${FluentBundle} | null>(null);

    function ${FluentBundleProvider}({ children }: { children: ${ReactNode} }) {
      const locale = ${useLocale}();
      const [bundle, setBundle] = ${useState}<${FluentBundle} | null>(null);

      ${useEffect}(() => {
        let cancelled = false;

        let ftlPromise = ${ftlCache}.get(locale);
        if (!ftlPromise) {
          switch (locale) {
            ${locales
              .map((locale) => {
                const encoded = JSON.stringify(locale);
                const url = nameResolver.importDefault({
                  moduleName: `./locale/${locale}.ftl`,
                  as: `ftlUrl${$String.capitalize(locale)}`,
                });
                return dedent`
                  case ${encoded}:
                    ftlPromise = fetch(${url}).then((r) => r.text());
                    break;
                  `;
              })
              .join("\n")}
            default:
              throw new Error(\`Unsupported locale: '\${locale}'\`);
          }
          ${ftlCache}.set(locale, ftlPromise);
        }
        ftlPromise.then((source) => {
          if (cancelled) return;
          const bundle = new ${FluentBundle}(locale);
          bundle.addResource(new ${FluentResource}(source));
          setBundle(bundle);
        });

        return () => {
          cancelled = true;
          setBundle(null);
        };
      }, [locale]);

      return (
        <${FluentBundleContext}.Provider value={bundle}>
          {children}
        </${FluentBundleContext}.Provider>
      );
    }

    function ${translateMessage}(
      bundle: ${FluentBundle} | null,
      nodeId: string,
      expressionKey: string,
      args?: Record<string, ${FluentVariable}>,
    ): string {
      const pattern = bundle?.getMessage(nodeId)?.attributes?.[expressionKey];
      return pattern
        ? bundle!.formatPattern(pattern, args, [])
        : \`\${nodeId}.\${expressionKey}\`;
    }
    `;
}

export function generateLocaleContext(locales: readonly string[]) {
  const type = locales.map((l) => JSON.stringify(l)).join(" | ");

  return dedent`
    import { ReactNode, createContext, useContext } from "react";

    const LocaleContext = createContext<${type}>(${JSON.stringify(locales[0])});

    export interface LocaleProviderProps {
      locale: ${type};
      children: ReactNode;
    }

    export function LocaleProvider({ locale, children }: LocaleProviderProps) {
      return (
        <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
      );
    }

    export function useLocale(): ${type} {
      return useContext(LocaleContext);
    }
    `;
}

export function generateFtl(document: SceneDocument, locale: string): string {
  const messages: string[] = [];

  for (const nodeId of document.keys()) {
    let isFirstWrite = true;

    function visit(expression: Expression, expressionKey: string) {
      if (expression instanceof FluentMessageExpression) {
        if (isFirstWrite) {
          messages.push(`${nodeId} =`);
          isFirstWrite = false;
        }
        messages.push(
          fluentHelpers.encodeFtl(
            `.${expressionKey}`,
            expression.messages[locale],
          ),
        );

        for (const [name, arg] of Object.entries(expression.args)) {
          visit(arg!, `${expressionKey}-${name}`);
        }
      } else if (expression instanceof MemberAccessExpression) {
        const prefix = expression.parameterPrefix;
        for (const [i, arg] of expression.args.entries()) {
          if (arg) visit(arg, `${expressionKey}-${prefix}${i + 1}`);
        }
      }
    }

    document
      .getNode(nodeId)
      .forEachInput((expression, attributes, inputName, index) => {
        if (expression)
          visit(
            expression,
            index === undefined ? inputName : `${inputName}-${index + 1}`,
          );
      });
  }

  return messages.join("\n") + "\n";
}
