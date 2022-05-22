import { DepriveObject, DepriveProperty, DeprivePropertyType } from './core'
import { Animatable } from './anim/animatable'

export class Color {
  r: number
  g: number
  b: number
  a: number

  constructor(r: number, g: number, b: number, a?: number) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a || 100
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
  implements DepriveProperty, Animatable<Color>
{
  id: number
  type: DeprivePropertyType = DeprivePropertyType.Color
  parent: DepriveProperty | null
  object: DepriveObject | null

  constructor(
    id: number,
    parent: DepriveProperty | null,
    object: DepriveObject | null,
    c: Color
  ) {
    super(c.r, c.g, c.b, c.a)
    this.id = id
    this.parent = parent
    this.object = object
  }
}
