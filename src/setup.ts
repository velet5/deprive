import { Deprive } from './comp/deprive'
import { Color } from './comp/misc/color'
import { Point } from './comp/misc/point'
import { Size } from './comp/misc/size'
import { RivExporter } from './export/exporter'

export const make = (): Deprive => {
  const D = new Deprive()

  const x = 100
  const canvaseSize = new Size(x * 10, x * 10)
  const rectSize = new Size(x * 2, x * 2)
  const black = D.solidFill(new Color(0, 0, 0, 100))

  const artboard = D.artboard(Point.Zero, canvaseSize)
  const rectangle = D.rectangle(Point.Zero, rectSize).fill(black)
  const rectangle2 = D.rectangle(new Point(x * 4, x * 5), rectSize).fill(black)

  D.nest(artboard, rectangle)
  D.nest(rectangle, rectangle2)

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new RivExporter()

  return exporter.export(d)
}
