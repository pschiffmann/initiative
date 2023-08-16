import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from "@material/material-color-utilities";
import { RefObject, useEffect } from "react";

export function useColorTheme(
  ref: RefObject<HTMLElement>,
  scheme: "light" | "dark",
  brandColor = "#00796B",
  ctaColor = "#958DA5",
  errorColor = "#B3261E",
  neutralColor = "#939094",
): void {
  useEffect(() => {
    const element = ref.current!;

    element.style.setProperty("color-scheme", scheme);

    const brandPalette = TonalPalette.fromInt(argbFromHex(brandColor));
    for (const [name, value] of Object.entries(brandColorTokens[scheme])) {
      element.style.setProperty(
        `--initiative-color-${name}`,
        hexFromArgb(brandPalette.tone(value)),
      );
    }

    const ctaPalette = TonalPalette.fromInt(argbFromHex(ctaColor));
    for (const [name, value] of Object.entries(ctaColorTokens[scheme])) {
      element.style.setProperty(
        `--initiative-color-${name}`,
        hexFromArgb(ctaPalette.tone(value)),
      );
    }

    const errorPalette = TonalPalette.fromInt(argbFromHex(errorColor));
    for (const [name, value] of Object.entries(errorColorTokens[scheme])) {
      element.style.setProperty(
        `--initiative-color-${name}`,
        hexFromArgb(errorPalette.tone(value)),
      );
    }

    const neutralPalette = TonalPalette.fromInt(argbFromHex(neutralColor));
    for (const [name, value] of Object.entries(neutralColorTokens[scheme])) {
      element.style.setProperty(
        `--initiative-color-${name}`,
        hexFromArgb(neutralPalette.tone(value)),
      );
    }
  }, [ref, scheme, brandColor, ctaColor, errorColor, neutralColor]);
}

const brandColorTokens = {
  light: {
    brand: 40,
    "on-brand": 100,
    "brand-container": 90,
    "on-brand-container": 10,
    "inverse-brand": 80,
  },
  dark: {
    brand: 80,
    "on-brand": 20,
    "brand-container": 30,
    "on-brand-container": 90,
    "inverse-brand": 40,
  },
};

const ctaColorTokens = {
  light: {
    cta: 40,
    "on-cta": 100,
    "cta-container": 90,
    "on-cta-container": 10,
  },
  dark: {
    cta: 80,
    "on-cta": 20,
    "cta-container": 30,
    "on-cta-container": 90,
  },
};

const errorColorTokens = {
  light: {
    error: 40,
    "on-error": 100,
    "error-container": 90,
    "on-error-container": 10,
  },
  dark: {
    error: 80,
    "on-error": 20,
    "error-container": 30,
    "on-error-container": 90,
  },
};

const neutralColorTokens = {
  light: {
    surface: 98,
    "surface-container-highest": 90,
    "on-surface": 10,
    "on-surface-deemphasized": 30,
    "surface-container": 94,
    "inverse-surface": 20,
    "on-inverse-surface": 95,
    background: 98,
    "on-background": 10,
    outline: 50,
    divider: 80,
  },
  dark: {
    surface: 6,
    "surface-container-highest": 22,
    "on-surface": 90,
    "on-surface-deemphasized": 80,
    "surface-container": 12,
    "inverse-surface": 90,
    "on-inverse-surface": 20,
    background: 6,
    "on-background": 90,
    outline: 60,
    divider: 30,
  },
};
