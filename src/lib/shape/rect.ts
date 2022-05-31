import { Color } from '../color'
import { DepriveObject, DepriveObjectType, IdGenerator } from '../core'
import { Fill } from '../fill'
import { Point, Size } from '../misc'
import { DeprivePoint } from '../wrap/deprive-point'
import { Shape } from './shape'

export class Rectangle implements Shape {
  type: DepriveObjectType = DepriveObjectType.Ellipse

  private _size: Size
  private _position: Point
  private _fill: Fill

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
    this._fill = new Fill(this.generator.nextId(), this, generator).color(
      Shape.defaultColor
    )
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

  color(color: Color): Rectangle {
    this._fill.color(color)
    return this
  }

  fill(): Fill
  fill(fill: Fill): Rectangle
  fill(fill?: Fill): Fill | Rectangle {
    if (fill) {
      this._fill = fill
      return this
    }
    return this._fill
  }

  size(): Size {
    return this._size
  }
}
