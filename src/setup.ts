import { Color } from './lib/color'
import { Deprive } from './lib/deprive'
import { DepriveRiveExporter } from './lib/export/DepriveRiveExporter'
import { Point, Size } from './lib/misc'

export const make = (): Deprive => {
  const D = new Deprive()

  const red = new Color(255, 0, 0)
  const fill = D.fill(red)

  const canvasSide = 1000
  const canvasCenter = new Point(canvasSide / 2, canvasSide / 2)

  const headSide = 200
  const headSize = new Size(headSide, headSide)
  const headPosition = new Point(canvasCenter.x, headSide / 2)

  const head = D.ellipse(headSize, headPosition)

  D.artboard('canvas')
    .size({ width: canvasSide, height: canvasSide })
    .fill(fill)
    .ellipse(head)

  D.animation('move-head')
    .pingPong()
    .line(head.position().x, [
      { frame: 0, value: canvasCenter.x },
      { frame: 60, value: canvasSide - headSide / 2 },
    ])

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new DepriveRiveExporter()
  return exporter.export(d)
}
