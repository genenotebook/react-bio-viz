import React, { useEffect, useRef, useState } from 'react';
import * as CSS from 'csstype';
import { aaColors, ColorMap, PaletteName, BioLetter } from './util'

export interface SeqObject {
  header: string,
  sequence: string
}

interface RowProps {
  header: string,
  rowHeight: number
}

function Row({ header, rowHeight }: RowProps) : JSX.Element {
  const defaultStyle: CSS.Properties = {
    overflow: 'hidden',
    height: `${rowHeight}`,
    fontSize: '8',
    whiteSpace: 'nowrap'
  }

  const hoverStyle: CSS.Properties = {
    ...defaultStyle,
    overflow: 'visible',
  }
  const [isHover, setIsHover] = useState(false);
  const style = isHover ? hoverStyle : defaultStyle;
  return (
    <li
      key={header}
      style={style}
      onMouseOver={()=>{setIsHover(true)}}
      onMouseOut={()=>{setIsHover(false)}}
    >
      <span
        style={{
          backgroundColor: 'white',
          display: 'inline-block',
          zIndex: 2,
          paddingRight: '.25em'
        }}
      >
        {header}
      </span>
    </li>
  )
}

interface RowNamesProps {
  msa: SeqObject[],
  height: number,
  width: number,
  rowHeight: number,
}

function RowNames({
  msa,
  height,
  width,
  rowHeight,
}: RowNamesProps): JSX.Element {
  return (
    <ul
      style={{
        width,
        height,
        marginBlock: 0,
        paddingInline: 0,
        paddingRight: '.5em',
        overflow: 'visible',
        zIndex: 2
      }}
    > 
      {msa.map(({header}) => (
        <Row key={header} header={header} rowHeight={rowHeight} />
      ))}
    </ul>
  )
}

export interface MSAProps {
  msa: SeqObject[],
  width?: number,
  height?: number,
  palette?: string,
  rowHeight?: number,
  rowHeaderWidth?: number,
  showRowHeader?: boolean,
  colWidth?: number,
  showText?: boolean
}

export default function MultipleSequenceAlignment({
  msa,
  width,
  height,
  palette = 'individual',
  rowHeight = 10,
  rowHeaderWidth = 100,
  showRowHeader = true,
  colWidth = 10,
  showText = true
}: MSAProps): JSX.Element {
  const msaWidth = Object.values(msa)[0].sequence.length * colWidth;
  const canvasWidth = typeof width !== 'undefined'
    ? Math.max(width, msaWidth)
    : msaWidth;

  const maxWidth = typeof width === 'undefined'
    ? canvasWidth
    : width
  
  const canvasHeight = (msa.length + 1) * rowHeight;
  const maxHeight = typeof height === 'undefined'
    ? canvasHeight
    : height;
  const colorMap: ColorMap = aaColors.has(palette as PaletteName)
    ? aaColors.get(palette as PaletteName) as ColorMap
    : aaColors.get('polarity') as ColorMap

  const transposedMsa = msa[0].sequence
    .split('')
    .map((_, colIndex) => (
      msa.map(({ sequence }) => sequence.charAt(colIndex))
    ));
  const consensusSequence = getConsensus(transposedMsa);
  const consensus = {header: 'Consensus', sequence: consensusSequence}
  const msaWithConsensus = [consensus, ...msa];
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (context) {
        context.font = `${rowHeight - 2}px mono`;
        msaWithConsensus.forEach(({ header, sequence }, seq_i) => {
          // individual nucl/aa
          sequence.split('').forEach((letter, char_i) => {
            // draw a square
            context.fillStyle = colorMap.get(letter as BioLetter) || '#000000';
            context.fillRect(
              (char_i * colWidth), // + _rowHeaderWidth, // x
              seq_i * rowHeight, // y
              width = colWidth,
              height = rowHeight
            )
            // add the letter
            if (showText && colWidth >= 10 && rowHeight >= 10) {
              context.fillStyle = 'black';
              context.textAlign = 'center';
              context.fillText(
                letter, // text
                /*_rowHeaderWidth +*/ ((char_i + 0.5) * colWidth), // x
                (seq_i + 0.8) * rowHeight // y
              )
            }
          })
        })
      }
    }
  }, [msa])

  return (
    <div
      className='multiple-sequence-alignment'
      style={{display:'flex', maxHeight, overflow: 'auto'}}
    >
      {showRowHeader && 
        <RowNames
          msa={msaWithConsensus}
          height={maxHeight}
          width={rowHeaderWidth}
          rowHeight={rowHeight}
        />
      }
      <div style={{ maxWidth, marginBottom: -rowHeight }}>
        <canvas
          ref={canvasRef}
          height={canvasHeight}
          width={canvasWidth}
          style={{
            zIndex: 1
          }}
        />
      </div>
    </div>
  )
}

function getConsensus(transposedMsa: string[][]): string {
  return transposedMsa.map((seq: string[]) => {
    const countMap: Map<string, number> = new Map();
    let max = seq[0];
    let maxCount = 1;
    seq.forEach((s: string) => {
      const sCount = countMap.has(s)
        ? countMap.get(s)! + 1
        : 1;
      countMap.set(s, sCount)
      if (sCount > maxCount) {
        max = s;
        maxCount = sCount
      }
    })
    return max;
  }).join('')
}
