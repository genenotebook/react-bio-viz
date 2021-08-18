import React, { useEffect, useRef } from 'react';
import { aaColors, ColorMap } from './util'

export interface SeqObject {
  header: string,
  sequence: string
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
  const _rowHeaderWidth = showRowHeader ? rowHeaderWidth : 0;
  const _width = typeof width === 'undefined'
    ? (Object.values(msa)[0].sequence.length * colWidth) + _rowHeaderWidth
    : width
  const _height = typeof height === 'undefined'
    ? msa.length * rowHeight
    : height;
  const colorMap: ColorMap = aaColors.has(palette)
    ? aaColors.get(palette) as ColorMap
    : aaColors.get('polarity') as ColorMap

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (context) {
        context.font = `${rowHeight - 2}px mono`;
        msa.forEach(({ header, sequence }, seq_i) => {
          // header text
          if (showRowHeader) {
            context.fillStyle = 'black';
            context.textAlign = 'left';
            context.fillText(
              header, // text
              0, // x
              ((seq_i + 0.8) * rowHeight) // y
            )
          }
          // individual nucl/aa
          sequence.split('').forEach((letter, char_i) => {
            // draw a square
            context.fillStyle = colorMap.get(letter) || '#000000';
            context.fillRect(
              (char_i * colWidth) + _rowHeaderWidth, // x
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
                _rowHeaderWidth + ((char_i + 0.5) * colWidth), // x
                (seq_i + 0.8) * rowHeight // y
              )
            }
          })
        })
      }
    }
  }, [msa])

  return <canvas ref={canvasRef} height={_height} width={_width} />
}
