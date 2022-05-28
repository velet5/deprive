import { DepriveObject, DepriveObjectType } from './core'
import { Point, Size } from './misc'

export class Rectangle implements DepriveObject {
  type = DepriveObjectType.Rectangle

  _size: Size
  _position: Point

  constructor(
    public id: number,
    public parent: DepriveObject | null,
    size: Size,
    position: Point
  ) {
    this._size = size
    this._position = position
  }
}
