import React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { aaColors, ColorMap } from './util'

export interface SeqObject {
  header: string,
  seq: string
}

export interface MSAProps {
  msa: SeqObject[],
  width?: number,
  height?: number,
  palette?: string,
  rowHeight?: number,
  colWidth?: number,
  showText?: boolean
}

export default function MultipleSequenceAlignment({
  msa, width, height, palette = 'polarity', rowHeight = 10, colWidth = 10,
  showText = true
}: MSAProps) {
  const _width = typeof width === 'undefined'
    ? Object.values(msa)[0].seq.length * colWidth
    : width
  const _height = typeof height === 'undefined'
    ? msa.length * rowHeight
    : height;
  const colorMap: ColorMap = aaColors.has(palette)
    ? aaColors.get(palette) as ColorMap
    : aaColors.get('polarity') as ColorMap
  return (
    <div className='multiple-sequence-alignment'>
      <Stage width={_width} height={_height}>
        <Layer>
          {
            msa.map(({ header, seq }, seq_i) => {
              return seq.split('').map((letter, char_i) => {
                return (
                  <React.Fragment key={char_i}>
                    <Rect
                      x={char_i * colWidth}
                      y={seq_i * rowHeight}
                      width={colWidth}
                      height={rowHeight}
                      fill={
                        colorMap.get(letter)
                      }
                      stroke='light-grey'
                      strokeWidth={colWidth > 1 ? .05 : 0}
                    />
                    {(showText && colWidth >= 10) &&
                      <Text
                        text={letter.toUpperCase()}
                        x={(char_i * colWidth) + 2}
                        y={(seq_i * rowHeight + 2)}
                        fontSize={7}
                        fontFamily='mono'
                        align='center'
                      />
                    }
                  </React.Fragment>
                )
              })
            })
          }
        </Layer>
      </Stage>
    </div>
  )
}
