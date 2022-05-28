import { DepriveObject, DepriveObjectType, IdGenerator } from './core'
import { Point, Size } from './misc'
import { DeprivePoint } from './wrap/deprive-point'

export class Ellipse implements DepriveObject {
  type: DepriveObjectType = DepriveObjectType.Ellipse

  _size: Size
  _position: Point

  private _dPosition: DeprivePoint | null = null

  constructor(
    public id: number,
    public parent: DepriveObject | null,
    size: Size,
    position: Point,
    private generator: IdGenerator
  ) {
    this._size = size
    this._position = position
  }

  position(): DeprivePoint {
    if (!this._dPosition) {
      this._dPosition = new DeprivePoint(
        this,
        this._position,
        this.generator.nextId(),
        this.generator.nextId(),
        this.generator.nextId()
      )
    }
    return this._dPosition
  }
}
