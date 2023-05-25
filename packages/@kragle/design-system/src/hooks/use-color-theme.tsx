import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from "@material/material-color-utilities";
import { RefObject, useEffect } from "react";

export function useColorTheme(
  ref: RefObject<HTMLElement>,
  brandColor = "#00796B"
): void {
  useEffect(() => {
    const element = ref.current!;
    const palette = TonalPalette.fromInt(argbFromHex(brandColor));
    element.style.setProperty(
      `--kragle-color-brand`,
      hexFromArgb(palette.tone(40))
    );
    element.style.setProperty(
      `--kragle-color-on-brand`,
      hexFromArgb(palette.tone(90))
    );
    element.style.setProperty(
      `--kragle-color-brand-container`,
      hexFromArgb(palette.tone(90))
    );
    element.style.setProperty(
      `--kragle-color-on-brand-container`,
      hexFromArgb(palette.tone(10))
    );
  }, [ref, brandColor]);
}
