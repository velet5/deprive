import { DepriveObject, DepriveProperty, DeprivePropertyType } from './core'
import { Color } from './misc'

export class Fill implements DepriveProperty {
  type: DeprivePropertyType = DeprivePropertyType.Fill

  parent: DepriveProperty | null = null
  object: DepriveObject | null = null

  id: number

  _color: Color = new Color(0, 0, 0)
  _opacity: number = 1

  constructor(
    id: number,
    parent: DepriveProperty | null,
    object: DepriveObject | null
  ) {
    this.id = id
    this.parent = parent
    this.object = object
  }

  color(color: Color): Fill {
    this._color = color
    return this
  }

  opacity(opacity: number): Fill {
    this._opacity = opacity
    return this
  }
}
