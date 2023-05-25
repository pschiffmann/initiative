import {
  argbFromHex,
  hexFromArgb,
  TonalPalette,
} from "@material/material-color-utilities";
import { useRef } from "react";
import { Button, useColorTheme } from "../src/index.js";

export function App() {
  // return <ColorPalette />;
  const rootRef = useRef(document.body);
  useColorTheme(rootRef);
  return <Button label="Btn" />;
}

function ColorPalette() {
  return (
    <div>
      {Object.entries(sampleColors).map(([name, value]) => {
        const palette = TonalPalette.fromInt(argbFromHex(value));
        return (
          <div key={name} className="tonal-palette">
            <div className="tonal-palette__label">{name}</div>
            {m3Tones.map((tone) => (
              <div
                key={tone}
                className="tonal-palette__tone"
                style={{
                  background:
                    // tone <= 80
                    //   ? `linear-gradient(to right bottom, ${hexFromArgb(
                    //       palette.tone(tone)
                    //     )}, ${hexFromArgb(palette.tone(tone + 20))} 100%)`
                    //   :
                    hexFromArgb(palette.tone(tone)),
                }}
              >
                {tone}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

const sampleColors = {
  black: "#000000",
  silver: "#c0c0c0",
  gray: "#808080",
  white: "#ffffff",
  maroon: "#800000",
  red: "#ff0000",
  purple: "#800080",
  fuchsia: "#ff00ff",
  green: "#008000",
  lime: "#00ff00",
  olive: "#808000",
  yellow: "#ffff00",
  navy: "#000080",
  blue: "#0000ff",
  teal: "#008080",
  aqua: "#00ffff",
};

const m3Tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
