import randomColor from 'randomcolor'

const AMINO_ACIDS: string[] = [
  'G', 'A', 'V', 'L', 'I', 'F', 'W', 'M', 'P', 'S', 'T', 'C',
  'Y', 'N', 'Q', 'D', 'E', 'K', 'R', 'H', '-', '?', 'X', '*'
]

export type ColorMap = Map<string, string>

const aaColorsPolarity: ColorMap = new Map(
  AMINO_ACIDS.map(aa => {
    let color: string;
    if ('-?'.indexOf(aa) >= 0) {
      color = '#f0f0f0'
    } else if (aa === 'X') {
      color = 'grey'
    } else if (aa === '*') {
      color = 'black'
    } else if ('GAVLIFWMP'.indexOf(aa) >= 0) {
      color = 'yellow'
    } else if ('STCYNQ'.indexOf(aa) >= 0) {
      color = 'green'
    } else if ('DE'.indexOf(aa) >= 0) {
      color = 'red'
    } else if ('KRH'.indexOf(aa) >= 0) {
      color = 'blue'
    } else {
      color = 'white'
    }
    return [aa, color]
  })
)

const aaIndividualAas: ColorMap = new Map(
  AMINO_ACIDS.map(aa => {
    let color: string;
    if ('-?'.indexOf(aa) >= 0) {
      color = '#f0f0f0'
    } else if (aa === 'X') {
      color = 'grey'
    } else if (aa === '*') {
      color = 'black'
    } else {
      color = randomColor({ seed: aa })
    }
    return [aa, color]
  })
)


type PaletteMap = Map<string, ColorMap>

export const aaColors: PaletteMap = new Map([
  ['polarity', aaColorsPolarity],
  ['individual', aaIndividualAas]
])
