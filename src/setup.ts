import { Deprive } from './comp/deprive'
import { Color } from './comp/misc/color'
import { Point } from './comp/misc/point'
import { Size } from './comp/misc/size'
import { RivExporter } from './export/exporter'

export const make = (): Deprive => {
  const D = new Deprive()

  const black = D.solidFill(new Color(0, 0, 0, 100))
  const red = D.solidFill(new Color(255, 0, 0, 100))
  const x = 100
  const canvaseSize = new Size(x * 10, x * 10)

  const artboard = D.artboard(Point.Zero, canvaseSize)

  const legBones = D.bones(new Point(x * 5, x * 2), x * 2.5, 90, {
    length: x * 2.5,
    rotation: 0,
  })

  console.log(legBones)

  D.nest(artboard, legBones.primary)

  const part = () =>
    D.rectangle(new Point((x * 3.5 - x) / 2, 0), new Size(x * 3.5, x))
  const thigh = part()
  const shin = part()

  thigh.fill(black)
  shin.fill(red)

  D.nest(legBones.primary, thigh)
  D.nest(legBones.secondaries[0], shin)

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new RivExporter()

  return exporter.export(d)
}
