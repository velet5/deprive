import { AnimatableProperty } from './comp/anim/animation'
import { Deprive } from './comp/deprive'
import { Color } from './comp/misc/color'
import { Point } from './comp/misc/point'
import { Size } from './comp/misc/size'
import { Fill } from './comp/object/fill'
import { RivExporter } from './export/exporter'

export const make = (): Deprive => {
  const D = new Deprive()

  const black = D.solidFill(new Color(0, 0, 0, 50))
  const red = D.solidFill(new Color(255, 0, 0, 50))
  const x = 100
  const canvaseSize = new Size(x * 10, x * 10)

  const artboard = D.artboard(Point.Zero, canvaseSize)
  const body = D.group(new Point(canvaseSize.width / 2, 0))
  const head = D.ellipse(new Point(0, x), new Size(x * 2, x * 2)).fill(black)
  const torso = D.rectangle(
    new Point(0, x * 4),
    new Size(x, x * 4),
    x / 2
  ).fill(black)
  const setupPart = (position: Point, fill: Fill) => {
    const bones = D.bones(position, 2 * x, 0, {
      length: 2 * x,
      rotation: 0,
    })
    const primary = bones.primary
    const secondary = bones.secondaries[0]

    const top = D.rectangle(new Point(x, 0), new Size(x * 3, x), x / 2).fill(
      fill
    )
    const bottom = D.rectangle(new Point(x, 0), new Size(x * 3, x), x / 2).fill(
      fill
    )
    D.nest(body, primary)
    D.nest(primary, top)
    D.nest(secondary, bottom)

    return bones
  }

  D.nest(artboard, body)
  D.nest(body, head)
  D.nest(body, torso)

  const rightArm = setupPart(new Point(0, x * 2.5), red)
  const leftArm = setupPart(new Point(0, x * 2.5), black)
  const rightLeg = setupPart(new Point(0, x * 5.5), red)
  const leftLeg = setupPart(new Point(0, x * 5.5), black)

  const backSholulderRotation = 135
  const backHandRotation = -15
  const forwardSholulderRotation = 30
  const forwardHandRotation = -60

  const forwardThighRotation = 0
  const forwardShinRotation = 90
  const backThighRotation = 115
  const backShinRotation = 15

  D.animation('run')
    .pingPong()
    .line(body, AnimatableProperty.Rotation, { 0: 20 })
    .line(body, AnimatableProperty.X, { 0: x * 7 })
    .line(rightArm.primary, AnimatableProperty.Rotation, {
      0: backSholulderRotation,
      60: forwardSholulderRotation,
    })
    .line(rightArm.secondaries[0], AnimatableProperty.Rotation, {
      0: backHandRotation,
      60: forwardHandRotation,
    })
    .line(leftArm.primary, AnimatableProperty.Rotation, {
      0: forwardSholulderRotation,
      60: backSholulderRotation,
    })
    .line(leftArm.secondaries[0], AnimatableProperty.Rotation, {
      0: forwardHandRotation,
      60: backHandRotation,
    })
    .line(rightLeg.primary, AnimatableProperty.Rotation, {
      0: forwardThighRotation,
      60: backThighRotation,
    })
    .line(rightLeg.secondaries[0], AnimatableProperty.Rotation, {
      0: forwardShinRotation,
      60: backShinRotation,
    })
    .line(leftLeg.primary, AnimatableProperty.Rotation, {
      0: backThighRotation,
      60: forwardThighRotation,
    })
    .line(leftLeg.secondaries[0], AnimatableProperty.Rotation, {
      0: backShinRotation,
      60: forwardShinRotation,
    })

  return D
}

export const exportRive = (d: Deprive): Uint8Array => {
  const exporter = new RivExporter()

  return exporter.export(d)
}
