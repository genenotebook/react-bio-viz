import React from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
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
  return (
    <div className='multiple-sequence-alignment'>
      <Stage width={_width} height={_height}>
        <Layer>
          {
            msa.map(({ header, sequence }, seq_i) => {
              return (
                <React.Fragment key={header}>
                  <Text
                    text={header}
                    x={0}
                    y={(seq_i * rowHeight + 2)}
                    fontSize={7}
                    fontFamily='mono'
                    align='left'
                  />
                  {
                    sequence.split('').map((letter, char_i) => {
                      return (
                        <React.Fragment key={char_i}>
                          <Rect
                            x={(char_i * colWidth) + _rowHeaderWidth}
                            y={seq_i * rowHeight}
                            width={colWidth}
                            height={rowHeight}
                            fill={
                              colorMap.get(letter)
                            }
                            stroke='white'
                            strokeWidth={colWidth > 1 ? .5 : 0}
                          />
                          {(showText && colWidth >= 10) &&
                            <Text
                              text={letter.toUpperCase()}
                              x={(char_i * colWidth) + _rowHeaderWidth + 2}
                              y={(seq_i * rowHeight + 2)}
                              fontSize={7}
                              fontFamily='mono'
                              align='center'
                            />
                          }
                        </React.Fragment>
                      )
                    })
                  }
                </React.Fragment>
              )
            })
          }
        </Layer>
      </Stage>
    </div>
  )
}
