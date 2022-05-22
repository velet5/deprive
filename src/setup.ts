import { AnimationKey } from './lib/anim/key'
import { Color } from './lib/color'
import { Deprive } from './lib/deprive'
import { DepriveRiveExporter } from './lib/export/DepriveRiveExporter'

export const make = (): Deprive => {
  const D = new Deprive()

  const red = new Color(255, 0, 0)
  const blue = new Color(0, 0, 255)

  const artboard = D.artboard('canvas').fill((f) => f.color(red))

  const fill = artboard._fills[0]

  const changeColor = D.animation('change-color')
    .duration(1000)
    .snapKeys(60)
    .pingPong()

  changeColor.line(fill.getColor(), [
    new AnimationKey(0, red),
    new AnimationKey(60, blue),
  ])

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new DepriveRiveExporter()
  return exporter.export(d)
}
