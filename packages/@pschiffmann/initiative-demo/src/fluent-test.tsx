import { FluentBundle, FluentResource } from "@fluent/bundle";
import messagesUrl from "./i10n/en.ftl";

const messagesResponse = await fetch(messagesUrl);
const messagesContent = await messagesResponse.text();

const bundle = new FluentBundle("de");
console.log(
  "FluentBundle.addResource() errors: ",
  bundle.addResource(new FluentResource(messagesContent)),
);
console.log(bundle);

console.log(bundle.formatPattern(bundle.getMessage("greeting")!.value!));
