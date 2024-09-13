export class ZoomBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  constructor({xMin=0, xMax, yMin=0, yMax, x0, x1, y0, y1}: {
    xMin?: number,
    xMax: number,
    yMin?: number,
    yMax: number,
    x0?: number,
    x1?: number,
    y0?: number,
    y1?: number
  }) {
    this.xMin = xMin;
    this.x0 = typeof x0 !== 'undefined' ? x0 : xMin;
    this.xMax = xMax;
    this.x1 = typeof x1 !== 'undefined' ? x1 : xMax;
    this.yMin = yMin;
    this.y0 = typeof y0 !== 'undefined' ? y0 : yMin;
    this.yMax = yMax;
    this.y1 = typeof y1 !== 'undefined' ? y1 : yMax;
  }
  zoomInX(scale: number = 0.1){
    this.x0 = Math.max(this.xMin, this.x0 * (1 - scale))
    this.x1 = Math.min(this.xMax, this.x1 * (1 + scale))
    return this
  }
  zoomInY(scale: number = 0.1){
    this.y0 = Math.max(this.yMin, this.y0 * (1 - scale))
    this.y1 = Math.min(this.yMax, this.y1 * (1 + scale))
    return this
  }
  zoomIn(scale: number = 0.1){
    return this.zoomInX(scale).zoomInY(scale)
  }

  zoomOutX(scale: number = 0.1){
    this.x0 = Math.max(this.xMin, this.x0 * (1 + scale))
    this.x1 = Math.min(this.xMax, this.x1 * (1 - scale))
    return this
  }
  zoomOutY(scale: number = 0.1){
    this.y0 = Math.max(this.yMin, this.y0 * (1 + scale))
    this.y1 = Math.min(this.yMax, this.y1 * (1 - scale))
    return this
  }
  zoomOut(scale: number = 0.1){
    return this.zoomInX(scale).zoomInY(scale)
  }

  panLeft(scale: number = 0.1){
    this.x0 = Math.max(this.xMin, this.x0 * (1 - scale))
    this.x1 = Math.min(this.xMax, this.x1 * (1 - scale))
    return this
  }

  panRight(scale: number = 0.1){
    this.x0 = Math.max(this.xMin, this.x0 * (1 + scale))
    this.x1 = Math.min(this.xMax, this.x1 * (1 + scale))
    return this
  }

  panTop(scale: number = 0.1){
    this.y0 = Math.max(this.yMin, this.y0 * (1 - scale))
    this.y1 = Math.min(this.yMax, this.y1 * (1 - scale))
    return this
  }

  panBottom(scale: number = 0.1){
    this.y0 = Math.max(this.yMin, this.y0 * (1 + scale))
    this.y1 = Math.min(this.yMax, this.y1 * (1 + scale))
    return this
  }
}