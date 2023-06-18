import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from "@material/material-color-utilities";
import { RefObject, useEffect } from "react";

export function useColorTheme(
  ref: RefObject<HTMLElement>,
  brandColor = "#00796B",
  ctaColor = "#958DA5",
  errorColor = "#B3261E",
  neutralColor = "#939094"
): void {
  useEffect(() => {
    const element = ref.current!;

    const brandPalette = TonalPalette.fromInt(argbFromHex(brandColor));
    for (const [name, value] of Object.entries(brandColorTokens)) {
      element.style.setProperty(
        `--kragle-color-${name}`,
        hexFromArgb(brandPalette.tone(value))
      );
    }

    const ctaPalette = TonalPalette.fromInt(argbFromHex(ctaColor));
    for (const [name, value] of Object.entries(ctaColorTokens)) {
      element.style.setProperty(
        `--kragle-color-${name}`,
        hexFromArgb(ctaPalette.tone(value))
      );
    }

    const errorPalette = TonalPalette.fromInt(argbFromHex(errorColor));
    for (const [name, value] of Object.entries(errorColorTokens)) {
      element.style.setProperty(
        `--kragle-color-${name}`,
        hexFromArgb(errorPalette.tone(value))
      );
    }

    const neutralPalette = TonalPalette.fromInt(argbFromHex(neutralColor));
    for (const [name, value] of Object.entries(neutralColorTokens)) {
      element.style.setProperty(
        `--kragle-color-${name}`,
        hexFromArgb(neutralPalette.tone(value))
      );
    }
  }, [ref, brandColor]);
}

const brandColorTokens = {
  brand: 40,
  "on-brand": 100,
  "brand-container": 90,
  "on-brand-container": 10,
  "inverse-brand": 80,
};

const ctaColorTokens = {
  cta: 40,
  "on-cta": 100,
  "cta-container": 90,
  "on-cta-container": 10,
};

const errorColorTokens = {
  error: 40,
  "on-error": 100,
  "error-container": 90,
  "on-error-container": 10,
};

const neutralColorTokens = {
  surface: 98,
  "on-surface": 10,
  "on-surface-deemphasized": 30,
  "surface-container": 94,
  "inverse-surface": 20,
  "on-inverse-surface": 95,
  background: 98,
  "on-background": 10,
  outline: 50,
};
