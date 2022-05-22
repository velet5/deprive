import { AnimationKey } from './lib/anim/key'
import { Color } from './lib/color'
import { Deprive } from './lib/deprive'
import { DepriveRiveExporter } from './lib/export/DepriveRiveExporter'

export const make = (): Deprive => {
  const D = new Deprive()

  const red = new Color(255, 0, 0)
  const green = new Color(0, 255, 0)

  const fill = D.fill(red)

  D.artboard('canvas').fill(fill)

  D.animation('change-color').line(fill.getColor(), [
    new AnimationKey(0, red),
    new AnimationKey(60, green),
  ])

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new DepriveRiveExporter()
  return exporter.export(d)
}
