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
  const red = Color.fromHex('#FF0000')
  const green = Color.fromHex('#00FF00')

  const blueEllipse = D.ellipse(headSize, headPosition).color(blue)
  const blackEllipse = D.ellipse(headSize, canvasCenter).color(black)
  const redEllipse = D.ellipse(headSize, headPosition).color(red)
  const greenEllipse = D.ellipse(headSize, headPosition).color(green)

  D.artboard('canvas')
    .size({ width: canvasSide, height: canvasSide })
    .ellipse(blueEllipse)
    .ellipse(blackEllipse)
    .ellipse(redEllipse)
    .ellipse(greenEllipse)

  const halfHead = headSide / 2

  const start = halfHead
  const finish = canvasSide - halfHead

  D.animation('move')
    .duration(1000)
    .pingPong()
    .line(blueEllipse.position().x, [
      { frame: 0, value: start },
      { frame: 60, value: finish },
    ])
    .line(blueEllipse.position().y, [
      { frame: 0, value: finish },
      { frame: 60, value: start },
    ])
    .line(blackEllipse.position().x, [
      { frame: 0, value: finish },
      { frame: 60, value: start },
    ])
    .line(redEllipse.position().x, [
      { frame: 0, value: finish },
      { frame: 60, value: start },
    ])
    .line(redEllipse.position().y, [
      { frame: 0, value: finish },
      { frame: 15, value: start },
      { frame: 30, value: finish },
      { frame: 45, value: start },
      { frame: 60, value: finish },
    ])
    .line(greenEllipse.position().y, [
      { frame: 0, value: start },
      { frame: 60, value: finish },
    ])

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new DepriveRiveExporter()
  return exporter.export(d)
}
