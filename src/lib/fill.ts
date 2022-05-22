import { Color, DepriveColor } from './color'
import {
  DepriveObject,
  DepriveProperty,
  DeprivePropertyType,
  IdGenerator,
} from './core'

export class Fill implements DepriveProperty {
  type: DeprivePropertyType = DeprivePropertyType.Fill

  parent: DepriveProperty | null = null
  object: DepriveObject | null = null

  id: number

  private _color?: DepriveColor

  private idGenerator: IdGenerator

  constructor(
    id: number,
    parent: DepriveProperty | null,
    object: DepriveObject | null,
    idGenerator: IdGenerator
  ) {
    this.id = id
    this.parent = parent
    this.object = object
    this.idGenerator = idGenerator
  }

  color(color: Color): Fill {
    this._color = new DepriveColor(this.idGenerator.nextId(), this, null, color)
    return this
  }

  getColor(): DepriveColor {
    return this._color!
  }
}
