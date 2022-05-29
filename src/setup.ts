import { Color } from './lib/color'
import { Deprive } from './lib/deprive'
import { DepriveRiveExporter } from './lib/export/DepriveRiveExporter'
import { Point, Size } from './lib/misc'

export const make = (): Deprive => {
  const D = new Deprive()

  const canvasSide = 1000
  const canvasCenter = new Point(canvasSide / 2, canvasSide / 2)

  const headSide = 200
  const headSize = new Size(headSide, headSide)
  const headPosition = new Point(canvasCenter.x, headSide / 2)

  const blue = Color.fromHex('#0000FF')
  const black = Color.fromHex('#000000')

  const blueEllipse = D.ellipse(headSize, headPosition).color(blue)
  const blackEllipse = D.ellipse(headSize, canvasCenter).color(black)

  D.artboard('canvas')
    .size({ width: canvasSide, height: canvasSide })
    .ellipse(blueEllipse)
    .ellipse(blackEllipse)

  const halfHead = headSide / 2

  D.animation('move')
    .duration(1000)
    .pingPong()
    .line(blueEllipse.position().x, [
      { frame: 0, value: halfHead },
      { frame: 60, value: canvasSide - halfHead },
    ])
    .line(blueEllipse.position().y, [
      { frame: 0, value: halfHead },
      { frame: 30, value: canvasSide - halfHead },
      { frame: 60, value: halfHead },
    ])
    .line(blackEllipse.position().x, [
      { frame: 0, value: canvasSide - halfHead },
      { frame: 60, value: halfHead },
    ])

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new DepriveRiveExporter()
  return exporter.export(d)
}
