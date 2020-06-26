import React from 'react';
import { scaleLinear, ScaleLinear } from 'd3';
import randomColor from 'randomcolor';
import Color from 'color';
import { groupBy, Dictionary } from 'lodash';

export interface SequenceInterval {
  ID: string,
  seqid: string,
  source: string,
  interval_type: string,
  start: number,
  end: number,
  score: number | string,
  strand: string,
  phase: number | string,
  attributes: Record<string, any>
}

export interface Gene extends SequenceInterval {
  children: SequenceInterval[]
}

type ReactChildren = JSX.Element[] | JSX.Element;

interface SequenceIntervalProps {
  interval: SequenceInterval,
  fill: Color<string>,
  scale: ScaleLinear<number, number>
}

function SequenceInterval({ interval, fill, scale }: SequenceIntervalProps) {
  const { start, end, interval_type } = interval
  const height = interval_type === 'CDS' ? 10 : 4;
  return (
    <rect x={scale(start)} width={scale(end) - scale(start)} y={-height / 2} height={height} fill={fill.toString()} />
  )
}

interface TranscriptProps {
  transcript: SequenceInterval,
  children: ReactChildren,
  scale: ScaleLinear<number, number>,
  index: number,
}

function Transcript({ transcript, scale, index, children }: TranscriptProps) {
  const { start, end } = transcript;
  return (
    <g className='transcript' transform={`translate(0,${index * 14})`}>
      <line
        x1={scale(start)}
        x2={scale(end)}
        y1={0}
        y2={0}
        stroke='black'
        markerEnd="url(#arrowEnd)"
      />
      {children}
    </g>
  )
}

interface GeneModelGroupProps {
  gene: Gene,
  children: ReactChildren,
  scale: ScaleLinear<number, number>
}

function GeneModelGroup({ gene, children, scale }: GeneModelGroupProps) {
  return (
    <g className="genemodel" transform="translate(0,4)">
      {
        React.Children.map(children, child => (
          React.cloneElement(child, { gene, scale })
        ))
      }
    </g>
  )
}

interface getTranscriptChildrenOptions {
  transcript: SequenceInterval, intervals: Dictionary<SequenceInterval[]>
}

function getTranscriptChildren({
  transcript, intervals
}: getTranscriptChildrenOptions): SequenceInterval[] {
  const children: SequenceInterval[] = []
  for (const _intervals of Object.values(intervals)) {
    for (const interval of _intervals) {
      const intervalParents = interval.attributes.parent || []
      if (intervalParents.indexOf(transcript.ID) >= 0) {
        children.push(interval)
      }
    }
  }
  return children.filter(c => c.interval_type !== 'mRNA')
}

interface GeneModelProps {
  gene: Gene,
  width?: number
}

export default function GeneModel({
  gene, width = 500
}: GeneModelProps): JSX.Element {
  const geneLength = gene.end - gene.start;
  const padding = Math.round(0.1 * geneLength);
  const start = Math.max(0, gene.start - padding);
  const end = gene.end + padding;
  const intervals = groupBy(gene.children, interval => interval.ID)
  const transcripts = gene.children
    .filter((child) => child.interval_type === 'mRNA');
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

  const baseColor = new Color(randomColor({ seed: gene.ID }));

  return (
    <div className='genemodel'>
      <svg height={height} width={width}>
        <GeneModelGroup gene={gene} scale={scale}>
          {
            transcripts.map((transcript: SequenceInterval, index) => {
              const transcriptChildren = getTranscriptChildren({
                transcript, intervals
              })
              return (
                <Transcript
                  scale={scale}
                  key={transcript.ID}
                  transcript={transcript}
                  index={index}
                >
                  {
                    transcriptChildren
                      .map((interval: SequenceInterval) => (
                        <SequenceInterval
                          scale={scale}
                          key={interval.ID}
                          interval={interval}
                          fill={baseColor.rgb()}
                        />
                      ))
                  }
                </Transcript>
              )
            })
          }
        </GeneModelGroup>
        <defs>
          <marker id="arrowEnd" markerWidth="16" markerHeight="10"
            refX="0" refY="5" orient="auto">
            <path d="M0,5 L15,5 L10,10 M10,0 L15,5" fill="none"
              stroke="black" />
          </marker>
        </defs>
      </svg>
    </div >
  )
}