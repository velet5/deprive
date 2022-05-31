import { Artboard } from './lib/artboard'
import { Color } from './lib/color'
import { Deprive } from './lib/deprive'
import { DepriveRiveExporter } from './lib/export/DepriveRiveExporter'
import { Point, Size } from './lib/misc'

const bars = (D: Deprive, board: Artboard) => {
  const gray = Color.fromHex('#000000')
  for (let i = 0; i < 10; i++) {
    const bar = D.rectangle(new Size(1000, 1), new Point(500, i * 100)).color(
      gray
    )

    board.rectangle(bar)
  }

  for (let i = 0; i < 10; i++) {
    const bar = D.rectangle(new Size(1, 1000), new Point(i * 100, 500)).color(
      gray
    )

    board.rectangle(bar)
  }
}

export const make = (): Deprive => {
  const D = new Deprive()

  const black = Color.fromHex('#000000')

  const x = 100
  const canvasSide = 10 * x

  const canvasCenter = new Point(canvasSide / 2, canvasSide / 2)
  const headSize = new Size(2 * x, 2 * x)
  const headPos = new Point(canvasCenter.x, x)
  const head = D.ellipse(headSize, headPos).color(black)

  const torsoSize = new Size(x, 4 * x)
  const torsoPos = new Point(canvasCenter.x, 4 * x)
  const torso = D.rectangle(torsoSize, torsoPos).color(black)

  const partSize = new Size(x, x * 3)
  const leftShoulder = D.rectangle(
    partSize,
    new Point(canvasCenter.x, headSize.height + partSize.height / 2)
  ).color(black)

  const rightShoulder = D.rectangle(
    partSize,
    new Point(canvasCenter.x, headSize.height + partSize.height / 2)
  ).color(black)

  const leftForearm = D.rectangle(
    partSize,
    new Point(canvasCenter.x, headSize.height + partSize.height + x * 1.5)
  ).color(black)

  const rightForearm = D.rectangle(
    partSize,
    new Point(canvasCenter.x, headSize.height + partSize.height + x * 1.5)
  ).color(black)

  const artboard = D.artboard('canvas')
    .size({ width: canvasSide, height: canvasSide })
    .ellipse(head)
    .rectangle(leftForearm)
    .rectangle(rightForearm)
    .rectangle(rightShoulder)
    .rectangle(leftShoulder)
    .rectangle(torso)

  bars(D, artboard)

  D.animation('move')
    .duration(1000)
    .pingPong()
    .line(head.position().x(), [{ frame: 0, value: headPos.x }])

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new DepriveRiveExporter()
  return exporter.export(d)
}
