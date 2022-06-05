import { AnimatableProperty } from './comp/anim/animation'
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

  D.nest(artboard, legBones.primary)

  const part = () =>
    D.rectangle(new Point((x * 3.5 - x) / 2, 0), new Size(x * 3.5, x))
  const thigh = part().fill(black)
  const shin = part().fill(red)

  D.nest(legBones.primary, thigh)
  D.nest(legBones.secondaries[0], shin)

  D.animation('move')
    .pingPong()
    .line(legBones.primary, AnimatableProperty.Rotation, {
      0: 90,
      60: 0,
    })
    .line(legBones.secondaries[0], AnimatableProperty.Rotation, {
      0: 0,
      60: 90,
    })

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new RivExporter()

  return exporter.export(d)
}
