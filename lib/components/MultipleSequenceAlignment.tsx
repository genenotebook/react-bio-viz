import { useEffect, useRef } from "react";
import { aaColors, ColorMap, PaletteName, BioLetter } from "./util";
import { css } from "@emotion/css";

/** @public */
export type Sequence = {
  // Sequence identifier (e.g. from fasta header)
  header: string;
  // Arbitrary biological sequence (nucleotide, amino acid, etc.)
  sequence: string;
};

/** @public */
export type MSA = Sequence[];

function RowNames({
  msa,
  height,
  width,
  rowHeight,
}: {
  msa: MSA;
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
              fontWeight: header === "Consensus" ? 800 : 500,
            })}
          >
            {header}
          </span>
        </li>
      ))}
    </ul>
  );
}

function getConsensus(msa: MSA): string {
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

/** @public */
export interface MultipleSequenceAlignmentProps {
  /**JSON formated multiple sequence alignment */
  msa: MSA;
  /**Maximum width of the HTML element, if the MSA is wider a scroll bar appears (default = num_columns * colWidth) */
  width?: number;
  /**Width in pixels of individual columns in the MSA visualization (default = 10)*/
  colWidth?: number;
  /**Maximum height of the HTML element, if the MSA is higher a scroll bar appears (default = num_sequences * rowHeight)*/
  height?: number;
  /**Height in pixels of indivual rows in the MSA visualization (default = 10) */
  rowHeight?: number;
  /**Color palette for coloring different residue types (default = 'individual') */
  palette?: PaletteName;
  /**Show sequence names (default = true)*/
  showRowHeader?: boolean;
  /**Maximum width in pixels of the sequence name field (default = 100) */
  rowHeaderWidth?: number;
  /**Show letters for individual residues in the alignment */
  showText?: boolean;
  /**Add consensus sequence at the top of the alignment */
  addConsensus?: boolean;
}

/**
 * @public
 * @returns
 */
export function MultipleSequenceAlignment({
  msa,
  width,
  height,
  palette = "individual",
  rowHeight = 10,
  rowHeaderWidth = 100,
  showRowHeader = true,
  colWidth = 10,
  showText = true,
  addConsensus = true,
}: MultipleSequenceAlignmentProps): JSX.Element {
  const msaWidth = Object.values(msa)[0].sequence.length * colWidth;
  const canvasWidth =
    typeof width !== "undefined" ? Math.max(width, msaWidth) : msaWidth;

  const maxWidth = typeof width === "undefined" ? canvasWidth : width;

  const canvasHeight = (msa.length + 1) * rowHeight;
  const maxHeight = typeof height === "undefined" ? canvasHeight : height;
  const colorMap: ColorMap = aaColors.has(palette as PaletteName)
    ? (aaColors.get(palette as PaletteName) as ColorMap)
    : (aaColors.get("polarity") as ColorMap);

  const msaWithConsensus = addConsensus
    ? [{ header: "Consensus", sequence: getConsensus(msa) }, ...msa]
    : msa;

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
        maxWidth,
        overflowX: msaWidth < maxWidth ? "hidden" : "auto",
        overflowY: canvasHeight < maxHeight ? "hidden" : "auto",
      })}`}
    >
      {showRowHeader && (
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
