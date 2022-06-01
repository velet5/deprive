import { Color } from './lib/color'
import { Deprive } from './lib/deprive'
import { DepriveRiveExporter } from './lib/export/DepriveRiveExporter'
import { Point, Size } from './lib/misc'

export const make = (): Deprive => {
  const D = new Deprive()

  const black = Color.fromHex('#000000')
  const blue = Color.fromHex('#0000ff')

  const x = 100
  const canvasSide = 10 * x

  const canvasCenter = new Point(canvasSide / 2, canvasSide / 2)
  const headSize = new Size(2 * x, 2 * x)
  const headPos = new Point(canvasCenter.x, x)
  const head = D.ellipse(headSize, headPos).color(black)
  const torso = D.rectangle(new Size(2 * x, 2 * x), headPos).color(blue)

  D.artboard('canvas')
    .size({ width: canvasSide, height: canvasSide })
    .ellipse(head)
    .rectangle(torso)

  D.animation('move')
    .pingPong()
    .line(head.position().y(), { 0: x, 60: x * 9 })
    .line(torso.position().x(), { 0: x, 60: x * 9 })

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new DepriveRiveExporter()
  return exporter.export(d)
}
