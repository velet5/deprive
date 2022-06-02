import { Deprive } from './comp/deprive'
import { Color } from './comp/misc/color'
import { Point } from './comp/misc/point'
import { Size } from './comp/misc/size'

export const make = (): Deprive => {
  const D = new Deprive()

  const x = 100
  const canvaseSize = new Size(x * 10, x * 10)
  const rectSize = new Size(x * 2, x * 2)
  const black = D.solidFill(new Color(0, 0, 0, 100))

  const artboard = D.artboard(Point.Zero, canvaseSize)
  const rectangle = D.rectangle(Point.Zero, rectSize).fill(black)

  D.nest(artboard, rectangle)

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  return new Uint8Array()
}
