import React, { useEffect, useRef } from "react";
import { aaColors, ColorMap, PaletteName, BioLetter } from "./util";
import { css } from "@emotion/css";

export type Sequence = {
  header: string;
  sequence: string;
};

function RowNames({
  msa,
  height,
  width,
  rowHeight,
}: {
  msa: Sequence[];
  height: number;
  width: number;
  rowHeight: number;
}): JSX.Element {
  return (
    <ul
      className={css({
        width,
        height,
        marginBlock: 0,
        paddingInline: 0,
        paddingRight: ".5em",
        overflow: "visible",
        zIndex: 2,
        fontFamily: "helvetica; arial; monospace",
      })}
    >
      {msa.map(({ header }) => (
        <li
          key={header}
          className={css({
            overflow: "hidden",
            height: rowHeight,
            fontSize: 8,
            whiteSpace: "nowrap",
            "&:hover": {
              overflow: "visible",
            },
          })}
        >
          <span
            className={css({
              backgroundColor: "white",
              display: "inline-block",
              zIndex: 2,
              paddingRight: ".25em",
            })}
          >
            {header}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function MultipleSequenceAlignment({
  msa,
  width,
  height,
  palette = "individual",
  rowHeight = 10,
  rowHeaderWidth = 100,
  showRowHeader = true,
  colWidth = 10,
  showText = true,
}: {
  msa: Sequence[];
  width?: number;
  height?: number;
  palette?: string;
  rowHeight?: number;
  rowHeaderWidth?: number;
  showRowHeader?: boolean;
  colWidth?: number;
  showText?: boolean;
}): JSX.Element {
  const msaWidth = Object.values(msa)[0].sequence.length * colWidth;
  const canvasWidth =
    typeof width !== "undefined" ? Math.max(width, msaWidth) : msaWidth;

  const maxWidth = typeof width === "undefined" ? canvasWidth : width;

  const canvasHeight = (msa.length + 1) * rowHeight;
  const maxHeight = typeof height === "undefined" ? canvasHeight : height;
  const colorMap: ColorMap = aaColors.has(palette as PaletteName)
    ? (aaColors.get(palette as PaletteName) as ColorMap)
    : (aaColors.get("polarity") as ColorMap);

  const msaWithConsensus = [
    { header: "Consensus", sequence: getConsensus(msa) },
    ...msa,
  ];

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        context.font = `${rowHeight * 0.9}px monospace`;
        msaWithConsensus.forEach(({ sequence }, seq_i) => {
          // individual nucl/aa
          sequence.split("").forEach((letter, char_i) => {
            // draw a square
            context.fillStyle = colorMap.get(letter as BioLetter) || "#000000";
            context.fillRect(
              char_i * colWidth, // + _rowHeaderWidth, // x
              seq_i * rowHeight, // y
              (width = colWidth),
              (height = rowHeight)
            );
            // add the letter
            if (showText && colWidth >= 10 && rowHeight >= 10) {
              context.fillStyle = "black";
              context.textAlign = "center";
              context.fillText(
                letter, // text
                /*_rowHeaderWidth +*/ (char_i + 0.5) * colWidth, // x
                (seq_i + 0.8) * rowHeight // y
              );
            }
          });
        });
      }
    }
  }, [msa]);

  return (
    <div
      className={`multiple-sequence-alignment ${css({
        display: "flex",
        maxHeight,
        overflow: "auto",
      })}`}
    >
      {showRowHeader && rowHeight > 10 && (
        <RowNames
          msa={msaWithConsensus}
          height={maxHeight}
          width={rowHeaderWidth}
          rowHeight={rowHeight}
        />
      )}
      <div className={css({ maxWidth, marginBottom: -rowHeight })}>
        <canvas
          className={css({
            zIndex: 1,
          })}
          ref={canvasRef}
          height={canvasHeight}
          width={canvasWidth}
        />
      </div>
    </div>
  );
}

function getConsensus(msa: Sequence[]): string {
  const transposedMsa = msa[0].sequence
    .split("")
    .map((_, colIndex) => msa.map(({ sequence }) => sequence.charAt(colIndex)));
  return transposedMsa
    .map((seq: string[]) => {
      const countMap: Map<string, number> = new Map();
      let max = seq[0];
      let maxCount = 1;
      seq.forEach((s: string) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const sCount = countMap.has(s) ? countMap.get(s)! + 1 : 1;
        countMap.set(s, sCount);
        if (sCount > maxCount) {
          max = s;
          maxCount = sCount;
        }
      });
      return max;
    })
    .join("");
}
