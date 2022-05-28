import { Color, DepriveColor } from './color'
import { DepriveObject, DepriveObjectType, IdGenerator } from './core'

export class Fill implements DepriveObject {
  type: DepriveObjectType = DepriveObjectType.Fill

  parent: DepriveObject | null

  id: number

  private _color?: DepriveColor

  private idGenerator: IdGenerator

  constructor(
    id: number,
    parent: DepriveObject | null,
    idGenerator: IdGenerator
  ) {
    this.id = id
    this.parent = parent
    this.idGenerator = idGenerator
  }

  color(color: Color): Fill {
    this._color = new DepriveColor(this.idGenerator.nextId(), this, color)
    return this
  }

  getColor(): DepriveColor {
    return this._color!
  }
}
