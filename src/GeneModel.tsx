import React from 'react';
import { scaleLinear, ScaleLinear } from "d3";
import randomColor from "randomcolor";
import Color from "color";
import { groupBy, Dictionary } from "lodash";
import { css } from "@emotion/css";

import { Popover, PopoverTrigger, PopoverBody } from './popover'

const HOVER_CSS_CLASS = css({
  cursor: "pointer",
  strokeWidth: '1.5px',
  "&:hover": {
    strokeWidth: "3px",
    stroke: "hsl(204, 86%, 53%)", //Bulma info color
  },
});

const formatNumber = new Intl.NumberFormat().format;

function Scale({
  scale,
  numTicks,
  transform,
  seqid,
}: {
  scale: ScaleLinear<number, number, never>;
  numTicks: number;
  transform: string;
  seqid: string;
}): JSX.Element {
  const range = scale.range();
  const [start, end] = scale.domain();
  const stepSize = Math.round((end - start) / numTicks);
  const ticks = [];
  for (let i = 1; i < numTicks; i += 1) {
    ticks.push(start + i * stepSize);
  }
  return (
    <g
      className={css({ fontFamily: "helvetica; arial; monospace" })}
      transform={transform}
    >
      <line x1={range[0]} x2={range[1]} y1="5" y2="5" stroke="black" />
      <g>
        <line x1={range[0]} x2={range[0]} y1="0" y2="5" stroke="black" />
        <text x={range[0]} y="-10" dy="5" textAnchor="left" fontSize="10">
          {formatNumber(start)}
        </text>
      </g>
      {ticks.map((tick) => {
        const pos = scale(tick);
        return (
          <g key={tick}>
            <line x1={pos} x2={pos} y1="0" y2="5" stroke="black" />
            <text x={pos} y="-10" dy="5" textAnchor="middle" fontSize="10">
              {formatNumber(tick)}
            </text>
          </g>
        );
      })}
      <g>
        <line x1={range[1]} x2={range[1]} y1="0" y2="5" stroke="black" />
        <text x={range[1]} y="-10" dy="5" textAnchor="end" fontSize="10">
          {formatNumber(end)}
        </text>
      </g>
      <text x={range[0]} y="15" dy="5" textAnchor="left" fontSize="11">
        {seqid}
      </text>
    </g>
  );
}

/**
 * Sequence interval object based on gff3 field specs. Recursively defined:
 * SequenceInterval children are SequenceIntervals themselves.
 */
export type SequenceInterval = {
  /**
   * Unique identifier for the sequence interval
   */
  ID: string;
  /**
   * Unique identifier of the sequence the interval belongs to
   */
  seqid: string;
  /**
   * Source of the sequence interval, i.e. what tool was used to generate
   * or which organisation provided the annotation
   */
  source: string;
  /**
   * Type of interval following the sequence ontology, e.g. mRNA, CDS, or gene
   */
  interval_type: string;
  /**
   * Start coordinate
   */
  start: number;
  /**
   * End coordinate
   */
  end: number;
  /**
   * Sequence interval confidence score
   */
  score: number | string;
  /**
   * Sequence strand
   */
  strand: "+" | "-" | ".";
  /**
   * Interval phase (only relevant for CDS features)
   */
  phase: 0 | 1 | 2 | ".";
  /**
   * Additional attributes (AKA gff3 column 9)
   * @example
   * ```json
   * {dbxref: ['InterPro:IPR002376','InterPro:IPR001555'], name:'PurN'}
   * ```
   */
  attributes: Record<string, string[] | string>;
  /**
   * Child sequence intervals of the current sequence interval. This makes
   * that genemodels can be represented as a Directed Acyclic Graph. A common
   * representation is `gene` -> `mRNA(s)` -> `exon(s)`
   */
  children?: SequenceInterval[];
};

type ReactChildren = JSX.Element[] | JSX.Element;

/**
 *
 * @param options {SequenceIntervalProps} Sequence Interval props
 * @returns SVG rect for sequence interval
 */
function Exon({
  interval,
  colorSeed,
  scale,
  exonPopoverFn
}: {
  /**
   * Sequence interval object
   */
  interval: SequenceInterval;
  /**
   * Seed string used to determine SVG rect fill
   */
  colorSeed: string;
  /**
   * D3 scale transforming genome coordinates to plot coordinates
   */
  scale: ScaleLinear<number, number>;
  /**
   * 
   */
  exonPopoverFn: (arg0: SequenceInterval) => JSX.Element
}) {
  const { start, end, interval_type, ID } = interval;

  const baseColor = new Color(randomColor({ seed: colorSeed }));
  const contrastColor = baseColor.isLight()
    ? baseColor.darken(0.5).saturate(0.3)
    : baseColor.lighten(0.5).desaturate(0.3);

  const fill = interval_type === "CDS" ? baseColor : contrastColor;
  const height = interval_type === "CDS" ? 10 : 4;
  return (
    <Popover>
      <PopoverTrigger>
        <rect
          x={scale(start)}
          width={scale(end) - scale(start)}
          y={-height / 2}
          height={height}
          fill={fill.toString()}
          className={HOVER_CSS_CLASS}
        />
      </PopoverTrigger>
      <PopoverBody header={ID}>
        { exonPopoverFn(interval) }
      </PopoverBody>
    </Popover>
  );
}

function Transcript({
  transcript,
  scale,
  index,
  children,
}: {
  transcript: SequenceInterval;
  children: ReactChildren;
  scale: ScaleLinear<number, number>;
  index: number;
}): JSX.Element {
  const { start, end } = transcript;
  return (
    <g className="transcript" transform={`translate(0,${index * 14})`}>
      <line
        x1={scale(start)}
        x2={scale(end)}
        y1={0}
        y2={0}
        stroke="black"
        markerEnd="url(#arrowEnd)"
        className={HOVER_CSS_CLASS}
      />
      {children}
    </g>
  );
}

function getTranscriptChildren({
  transcript,
  intervals,
}: {
  transcript: SequenceInterval;
  intervals: Dictionary<SequenceInterval[]>;
}): SequenceInterval[] {
  const children: SequenceInterval[] = [];
  for (const _intervals of Object.values(intervals)) {
    for (const interval of _intervals) {
      const intervalParents = interval.attributes.parent || [];
      if (intervalParents.indexOf(transcript.ID) >= 0) {
        children.push(interval);
      }
    }
  }
  return children.filter((c) => c.interval_type !== "mRNA");
}

function defaultPopoverFn(exon: SequenceInterval): JSX.Element {
  return <ul>
    <li>
      ID: {exon.ID}
    </li>
    <li>
      Source: {exon.source}
    </li>
    <li>
      Coordinates: {exon.seqid}:{exon.start}..{exon.end}
    </li>
    <li>
      Strand: {exon.strand}
    </li>
    <li>
      Score: {exon.score}
    </li>
    <li>
      Type: {exon.interval_type}
    </li>
    {
      Object
      .entries(exon.attributes)
      .map(([attributeName, attributeValues]) => {
        if (Array.isArray(attributeValues) && attributeValues.length > 1){
          return (
            <li>{attributeName}:
              <ul>
                {
                  attributeValues.map(attributeValue => (
                    <li>{attributeValue}</li>
                  ))
                }
              </ul>
            </li>
          )
        } else {
          return <li>
            {attributeName}: {attributeValues}
          </li>
        }
       
      })
    }
  </ul>
}

/**
 * GeneModel component
 * @example A minimal setting:
 *
 * ```typescript
 * import { GeneModel } from 'react-bio-viz';
 * <GeneModel gene={gene} />
 * ```
 *
 * @example Dynamically observing resize events using `react-resize-detector`:
 *
 * ```typescript
 * import { GeneModel } from 'react-bio-viz';
 * import ReactResizeDetector from 'react-resize-detector';
 * <ReactResizeDetector handleWidth>
 *  ({width}) => (
 *    <GeneModel gene={gene} width={wdith} />
 *  )
 * </ReactResizeDetector>
 * ```
 * @param options
 * @param options.gene SequenceInterval object of the gene
 * @param options.width Width of the rendered SVG element (default = 500)
 * @param options.colorSeed String to be used as seed for random color generation
 * (default = "42")
 * @param options.showScale Show a scalebar indicating genomic position
 * (default = true)
 */
export default function GeneModel({
  gene,
  width = 500,
  colorSeed = "42",
  showScale = true,
  exonPopoverFn = defaultPopoverFn
}: {
  gene: SequenceInterval;
  width?: number;
  colorSeed?: string;
  showScale?: boolean;
  exonPopoverFn?: (arg0: SequenceInterval) => JSX.Element
}): JSX.Element {
  const geneLength = gene.end - gene.start;
  const padding = Math.round(0.1 * geneLength);
  const start = Math.max(0, gene.start - padding);
  const end = gene.end + padding;
  const intervals = groupBy(gene.children, (interval) => interval.ID);
  const transcripts =
    gene.children?.filter((child) => child.interval_type === "mRNA") || [];
  const height = 14 * transcripts.length + 46;
  const margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  };

  const scale = scaleLinear()
    .domain([start, end])
    .range([margin.left, width - margin.right]);

  return (
    <div className="genemodel">
      <svg height={height} width={width}>
        <g className="genemodel" transform="translate(0,8)">
          {transcripts.map((transcript: SequenceInterval, index) => {
            const transcriptChildren = getTranscriptChildren({
              transcript,
              intervals,
            });
            return (
              <Transcript
                scale={scale}
                key={transcript.ID}
                transcript={transcript}
                index={index}
              >
                {transcriptChildren
                  .slice()
                  .sort((interval) =>
                    interval.interval_type === "CDS" ? 1 : 0
                  )
                  .map((interval: SequenceInterval) => (
                    <Exon
                      scale={scale}
                      key={interval.ID}
                      interval={interval}
                      colorSeed={colorSeed}
                      exonPopoverFn={exonPopoverFn}
                    />
                  ))}
              </Transcript>
            );
          })}
        </g> {/* End genemodelgroup */}
        {showScale && (
          <Scale
            scale={scale}
            numTicks={2}
            transform={`translate(0,${height - 22})`}
            seqid={gene.seqid}
          />
        )}
        <defs>
          <marker
            id="arrowEnd"
            markerWidth="16"
            markerHeight="10"
            refX="0"
            refY="5"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d="M0,5 L15,5 L10,10 M10,0 L15,5"
              fill="none"
              stroke="black"
            />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
