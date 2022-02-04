import React from "react";
import { scaleLinear, ScaleLinear } from "d3";
import randomColor from "randomcolor";
import Color from "color";
import { groupBy, Dictionary } from "lodash";

interface ScaleProps {
  scale: ScaleLinear<number, number, never>;
  numTicks: number;
  transform: string;
  seqid: string;
}

function Scale({ scale, numTicks, transform, seqid }: ScaleProps): JSX.Element {
  const formatNumber = new Intl.NumberFormat().format;

  const range = scale.range();

  const [start, end] = scale.domain();

  const stepSize = Math.round((end - start) / numTicks);

  const ticks = [];

  for (let i = 1; i < numTicks; i += 1) {
    ticks.push(start + i * stepSize);
  }

  return (
    <g className="x-axis" transform={transform}>
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

export interface SequenceInterval {
  ID: string;
  seqid: string;
  source: string;
  interval_type: string;
  start: number;
  end: number;
  score: number | string;
  strand: string;
  phase: number | string;
  attributes: Record<string, Array<string> | string>;
}

export interface Gene extends SequenceInterval {
  children: SequenceInterval[];
}

type ReactChildren = JSX.Element[] | JSX.Element;

interface SequenceIntervalProps {
  interval: SequenceInterval;
  colorSeed: string;
  scale: ScaleLinear<number, number>;
}

function SequenceInterval({
  interval,
  colorSeed,
  scale,
}: SequenceIntervalProps) {
  const { start, end, interval_type } = interval;

  const baseColor = new Color(randomColor({ seed: colorSeed }));
  const contrastColor = baseColor.isLight()
    ? baseColor.darken(0.5).saturate(0.3)
    : baseColor.lighten(0.5).desaturate(0.3);

  const fill = interval_type === "CDS" ? baseColor : contrastColor;
  const height = interval_type === "CDS" ? 10 : 4;
  return (
    <rect
      x={scale(start)}
      width={scale(end) - scale(start)}
      y={-height / 2}
      height={height}
      fill={fill.toString()}
      style={{
        cursor: "pointer",
      }}
    />
  );
}

interface TranscriptProps {
  transcript: SequenceInterval;
  children: ReactChildren;
  scale: ScaleLinear<number, number>;
  index: number;
}

function Transcript({ transcript, scale, index, children }: TranscriptProps) {
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
      />
      {children}
    </g>
  );
}

interface GeneModelGroupProps {
  gene: Gene;
  children: ReactChildren;
  scale: ScaleLinear<number, number>;
}

function GeneModelGroup({ gene, children, scale }: GeneModelGroupProps) {
  return (
    <g className="genemodel" transform="translate(0,4)">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { gene, scale })
      )}
    </g>
  );
}

interface getTranscriptChildrenOptions {
  transcript: SequenceInterval;
  intervals: Dictionary<SequenceInterval[]>;
}

function getTranscriptChildren({
  transcript,
  intervals,
}: getTranscriptChildrenOptions): SequenceInterval[] {
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

interface GeneModelProps {
  gene: Gene;
  width?: number;
  colorSeed?: string;
  showScale?: boolean;
}

export default function GeneModel({
  gene,
  width = 500,
  colorSeed = "42",
  showScale = true,
}: GeneModelProps): JSX.Element {
  const geneLength = gene.end - gene.start;
  const padding = Math.round(0.1 * geneLength);
  const start = Math.max(0, gene.start - padding);
  const end = gene.end + padding;
  const intervals = groupBy(gene.children, (interval) => interval.ID);
  const transcripts = gene.children.filter(
    (child) => child.interval_type === "mRNA"
  );
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
        <GeneModelGroup gene={gene} scale={scale}>
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
                    <SequenceInterval
                      scale={scale}
                      key={interval.ID}
                      interval={interval}
                      colorSeed={colorSeed}
                    />
                  ))}
              </Transcript>
            );
          })}
        </GeneModelGroup>
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
