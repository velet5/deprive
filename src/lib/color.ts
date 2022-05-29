import { Animatable, AnimatableProperty } from './anim/animatable'
import { DepriveObject, DepriveObjectType } from './core'

export class Color {
  r: number
  g: number
  b: number
  a: number

  constructor(r: number, g: number, b: number, a?: number) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a === 0 ? 0 : a || 100
  }

  static fromHex(hex: string, a?: number): Color {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return new Color(r, g, b, a)
  }
}

export class DepriveColor
  extends Color
  implements DepriveObject, Animatable<Color>
{
  id: number
  type: DepriveObjectType = DepriveObjectType.SolidColor
  parent: DepriveObject
  animProperty: AnimatableProperty = AnimatableProperty.Color

  constructor(id: number, parent: DepriveObject, c: Color) {
    super(c.r, c.g, c.b, c.a)
    this.id = id
    this.parent = parent
  }
}
