export type ColorMap = Map<string, string>

const aaColorsPolarity: ColorMap = new Map([
  ...'GAVLIFWMP'.split('').map(aa => [aa, 'yellow'] as [string, string]),
  ...'STCYNQ'.split('').map(aa => [aa, 'green'] as [string, string]),
  ...'DE'.split('').map(aa => [aa, 'red'] as [string, string]),
  ...'KRH'.split('').map(aa => [aa, 'red'] as [string, string]),
  ['-', 'white'],
  ['?', 'light-grey'],
  ['X', 'grey'],
  ['*', 'black']
])

type PaletteMap = Map<string, ColorMap>

export const aaColors: PaletteMap = new Map([
  ['polarity', aaColorsPolarity]
])
