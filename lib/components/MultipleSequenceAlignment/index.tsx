import { SyntheticEvent, useEffect, useReducer, useRef } from "react";
import { aaColors, ColorMap, PaletteName, BioLetter } from "../util";
import { css } from "@emotion/css";
import { getConsensus } from "./computations";
import { ZoomBox } from "./zoombox";

/** @public */
export type Sequence = {
  // Sequence identifier (e.g. from fasta header)
  header: string;
  // Arbitrary biological sequence (nucleotide, amino acid, etc.)
  sequence: string;
};

/** @public */
export type AlignedSequences = Sequence[];

function RowNames({
  msa,
  height,
  width,
  rowHeight,
}: {
  msa: AlignedSequences;
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

/** @public */
export interface MSABlockProps {
  /**JSON formated multiple sequence alignment */
  msa: AlignedSequences;
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
  /**  */
  zoombox: ZoomBox;
  /** */
  dispatch: React.Dispatch<MsaAction>;
  /** */
  overview: boolean;
}

/**
 * @public
 * @returns
 */
export function MSABlock({
  msa,
  width,
  height,
  palette = "individual",
  rowHeaderWidth = 100,
  showRowHeader = true,
  showText = true,
  addConsensus = true,
  zoombox,
  dispatch,
  overview = false,
}: MSABlockProps): JSX.Element {
  const numColumns = msa[0].sequence.length;
  const numSeqs = msa.length;
  const _width = typeof width === "undefined" ? numColumns * 10 : width;
  const _height = typeof height === "undefined" ? numSeqs * 10 : height;

  const colWidth = overview
    ? _width / numColumns
    : _width / ((zoombox.x1 - zoombox.x0) * numColumns);
  const rowHeight = overview
    ? _height / (numSeqs + 1)
    : _height / ((zoombox.y1 - zoombox.y0) * numSeqs);

  const msaWidth = msa[0].sequence.length * colWidth;
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

  const msaHeight = msaWithConsensus.length * rowHeight;

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
              colWidth,
              rowHeight
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
        if (overview) {
          context.beginPath();
          context.fillStyle = "rgba(200,200,200,0.5)";
          context.strokeStyle = "black";
          context.lineWidth = 1;
          context.rect(
            Math.max(1, zoombox.x0 * canvasWidth),
            Math.max(1, zoombox.y0 * canvasHeight),
            (zoombox.x1 - zoombox.x0) * canvasWidth,
            (zoombox.y1 - zoombox.y0) * canvasHeight
          );
          context.fill();
          context.stroke();
          context.closePath();
        }
      }
    }
  }, [msa]);

  function scrollHandler(event: SyntheticEvent) {
    const target = event.target as HTMLDivElement;
    const {
      offsetTop,
      offsetLeft,
      offsetWidth,
      offsetHeight,
      scrollLeft,
      scrollTop,
    } = target;

    const yStartFraction = scrollTop / msaHeight;
    const yEndFraction = (scrollTop + offsetHeight) / msaHeight;

    const xStartFraction = scrollLeft / msaWidth;
    const xEndFraction = (scrollLeft + offsetWidth) / msaWidth;

    console.log({
      yStartFraction,
      yEndFraction,
      xStartFraction,
      xEndFraction,
    });
  }

  return (
    <div
      className={`multiple-sequence-alignment ${css({
        display: "flex",
        maxHeight,
        maxWidth,
        overflowX: msaWidth <= maxWidth ? "hidden" : "auto",
        overflowY: canvasHeight <= maxHeight ? "hidden" : "auto",
      })}`}
      onScroll={scrollHandler}
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

/** @public */
export interface MultipleSequenceAlignmentProps {
  /**JSON formated multiple sequence alignment */
  msa: AlignedSequences;
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
  /** Add a zoomed out overview above the main MSA viewer*/
  showOverview?: boolean;
}

type MsaState = {
  zoombox: ZoomBox;
};

type MsaAction = { type: "panLeft" } | { type: "panRight" };

function msaReducer(state: MsaState, action: MsaAction) {
  switch (action.type) {
    case "panLeft":
      return { ...state, zoombox: state.zoombox.panLeft() };
    case "panRight":
      return { ...state, zoombox: state.zoombox.panRight() };
  }
}

export function MultipleSequenceAlignment({
  msa,
  width = 650,
  height = 400,
  palette = "individual",
  addConsensus = true,
  showOverview = true,
}: MultipleSequenceAlignmentProps): JSX.Element {
  const rowHeaderWidth = 150;
  const [{ zoombox }, dispatch] = useReducer(msaReducer, {
    zoombox: new ZoomBox({ xMax: 1, x1: 0.2, yMax: 1, y1: 0.2 }),
  });

  return (
    <>
      {showOverview && (
        <div className="msa-overview" style={{ marginLeft: rowHeaderWidth }}>
          <h2 className="subtitle">Overview</h2>
          <MSABlock
            msa={msa}
            colWidth={(width - rowHeaderWidth) / msa[0].sequence.length}
            width={width - rowHeaderWidth}
            height={0.25 * height}
            showRowHeader={false}
            showText={false}
            palette={palette}
            addConsensus={addConsensus}
            zoombox={zoombox}
            dispatch={dispatch}
            overview={true}
          />
        </div>
      )}

      <h2 className="subtitle">Detail</h2>
      <MSABlock
        msa={msa}
        width={width}
        rowHeaderWidth={rowHeaderWidth}
        height={0.75 * height}
        palette={palette}
        zoombox={zoombox}
        dispatch={dispatch}
      />
    </>
  );
}
