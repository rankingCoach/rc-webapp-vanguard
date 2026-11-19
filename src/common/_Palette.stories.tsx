import { SbDecorator } from "@test-utils/get-storybook-decorator";
import React, { useEffect, useState } from "react";
import { FontWeights, Text, TextTypes } from "@vanguard/Text/Text";
import { classNames } from "@helpers/classNames";
import { snackbarService } from "@vanguard/SnackbarRoot/SnackBarService";
import {
  alignItemsCenter,
  alignItemsEnd,
  cursorPointer,
  dFlex,
  dFlexColumn,
  flexWrap,
  justifyContentCenter,
  mr2,
  mt2,
  p2,
} from "@globalStyles";

type PaletteKeys = "brand-color" | "p" | "n" | "s" | "e" | "w" | "a1" | "a2" | "a3" | "i" | "fn" | "sc";
export default {
  ...SbDecorator({
  title: "Vanguard/Palette",
  component: null,
  tags: ['skip-test'],
}),
};

/*
The CSS property is always read as text, exactly as it is in the CSS file. This means you'll have to handle any needed
conversions and calculations yourself.
Considering you always declare the variables you want to access inside `:root`, this function does the job:
*/
const getAllCssVariables = () => {
  return Array.from(document.styleSheets)
    .filter((sheet) => sheet.href === null || sheet.href.startsWith(window.location.origin))
    .reduce(
      (acc, sheet) =>
        // @ts-ignore
        (acc = [
          ...acc,
          ...Array.from(sheet.cssRules).reduce(
            (def, rule: any) =>
              // @ts-ignore
              (def =
                rule.selectorText === ":root"
                  ? [...def, ...Array.from(rule.style).filter((name: string) => name.startsWith("--"))]
                  : def),
            [],
          ),
        ]),
      [],
    );
};

function readCssVar(varName: string) {
  varName = varName.startsWith("--") ? varName : "--" + varName;
  return window.getComputedStyle(document.documentElement).getPropertyValue(varName);
}

function hexToRgbA(hex: string, alfa: number) {
  hex = hex.trim();

  if (hex === "white") hex = "#ffffff";
  if (hex === "black") hex = "#000000";
  if (!hex) {
    return "";
  }
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + "," + alfa + ")";
  }
  // throw new Error('Bad Hex');
  console.warn("bad hex: " + hex);
}

const getFullNameFromKey = (key: PaletteKeys): string => {
  switch (key) {
    case "brand-color":
      return "Brand color";
    case "p":
      return "Primary";
    case "n":
      return "Neutral";
    case "s":
      return "Success";
    case "e":
      return "Error";
    case "w":
      return "Warning";
    case "a1":
      return "Accent 1";
    case "a2":
      return "Accent 2";
    case "a3":
      return "Accent 3";
    case "i":
      return "Info";
    case "fn":
      return "Functional";
    case "sc":
      return "Semantic Colors Charts";
  }
};

const getTextCutOff = (key: PaletteKeys): number => {
  switch (key) {
    case "brand-color":
      return -1;
    case "p":
      return 3;
    case "i":
      return 3;
    case "n":
      return 5;
    case "s":
      return 0;
    case "e":
      return 0;
    case "w":
      return 0;
    case "a1":
      return 3;
    case "a2":
      return 0;
    case "a3":
      return 0;
    case "fn":
      return 1000;
    case "sc":
      return -1;
  }
};

const copyColorToClipboard = (name: string, key: string) => {
  const toCopy = `var(--${name}${key})`;
  navigator.clipboard.writeText(toCopy);
  snackbarService.openSuccessSnackbar("Copied to clipboard: " + toCopy);
};
const PaletteComponent = () => {
  const [colorsPalette, setColorsPalette] = useState<any>(null);
  useEffect(() => {
    const mapped = {};
    const allCssVars: any = getAllCssVariables();
    for (let key of allCssVars) {
      const cutKey = key.substring(2);
      let index = 0;
      let palleteKey = cutKey.charAt(0);
      let defColorKey = null;

      if (palleteKey === "a") {
        // accent color
        index++;
        palleteKey = palleteKey + cutKey.charAt(1);
      }

      if (key === "--brand-color") {
        palleteKey = "brand-color";
        defColorKey = " ";
      }

      let isFunctionalColorKey = key.indexOf("--fn") > -1;

      if (isFunctionalColorKey) {
        palleteKey = "fn";
        defColorKey = cutKey.substring(2 + index);
      }

      let isSemanticColorsChartsColorKey = key.indexOf("--sc") > -1;

      if (isSemanticColorsChartsColorKey) {
        palleteKey = "sc";
        defColorKey = cutKey.substring(2 + index);
      }

      if (
        isNaN(parseInt(cutKey[index + 1])) &&
        key !== "--brand-color" &&
        !isFunctionalColorKey &&
        !isSemanticColorsChartsColorKey
      ) {
        continue;
      }

      if (!mapped[palleteKey]) {
        mapped[palleteKey] = {};
      }
      const colorKey = defColorKey ? defColorKey : cutKey.substring(1 + index);
      mapped[palleteKey][colorKey] = readCssVar(key);
    }

    setColorsPalette(mapped);
  }, []);

  if (!colorsPalette) {
    return <span>...Loading</span>;
  }

  // We write it manualy since we want to keep the ord
  const keys: PaletteKeys[] = ["brand-color", "fn", "sc", "p", "i", "n", "s", "e", "w", "a1", "a2", "a3"];

  return (
    <div>
      {keys.map((key: PaletteKeys) => {
        const colors = colorsPalette[key];
        const colorsKeys = Object.keys(colors);
        colorsKeys.sort();

        return (
          <div className={classNames(mt2)} key={key}>
            <Text type={TextTypes.textIntro} textAlign={"center"} fontWeight={FontWeights.bold}>
              {getFullNameFromKey(key)}
            </Text>

            <br />

            <div className={classNames(dFlex, p2, alignItemsEnd, mr2, flexWrap, justifyContentCenter)}>
              {colorsKeys.map((name, idx) => {
                const color: any = colors[name];
                const textColor = idx <= getTextCutOff(key) ? "black" : "white";
                const isRgb = name.indexOf("rgb") > -1;
                const isColor = color.indexOf("#") > -1;
                if (!isColor && !isRgb) {
                  return null;
                }

                return (
                  <div
                    key={name}
                    className={classNames(dFlexColumn, mt2, cursorPointer)}
                    onClick={() => copyColorToClipboard(key, name)}
                    style={{ border: "1px solid #f2eeee" }}
                  >
                    {!isRgb && (
                      <>
                        <div
                          className={classNames(alignItemsCenter, justifyContentCenter, dFlexColumn)}
                          style={{
                            height: name !== "500" ? 144 : 154,
                            backgroundColor: `var(--${key}${name})`,
                            width: 115,
                          }}
                        >
                          <div style={{ color: textColor }}>{name}</div>
                          <div style={{ color: textColor }}>{color}</div>
                          <div style={{ color: textColor }}>
                            --{key}
                            {name}
                          </div>
                        </div>
                        <div
                          className={classNames(dFlex, alignItemsCenter, justifyContentCenter)}
                          style={{
                            backgroundColor: hexToRgbA(color, 0.5),
                            minHeight: 40,
                          }}
                        >
                          <div style={{ color: textColor }}>A05</div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ borderBottom: "0.5px solid #333" }} />
          </div>
        );
      })}
    </div>
  );
};

export const Primary = {
  render: () => <PaletteComponent />,
};
