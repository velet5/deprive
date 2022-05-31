import { Animatable, AnimatableProperty } from '../anim/animatable'
import { DepriveObject } from '../core'
import { Point } from '../misc'

export class DeprivePoint implements Animatable<Point> {
  id: number
  _x: DepriveX
  _y: DepriveY

  animProperty: AnimatableProperty = AnimatableProperty.Point

  constructor(
    public parent: DepriveObject,
    position: Point,
    id: number,
    xId: number,
    yId: number
  ) {
    this.id = id
    this._x = new DepriveX(xId, parent, position.x)
    this._y = new DepriveY(yId, parent, position.y)
  }

  x(): DepriveX
  x(value: number): DeprivePoint
  x(value?: number): DepriveX | DeprivePoint {
    if (value == undefined) {
      return this._x
    }
    this._x.value = value
    return this
  }

  y(): DepriveY
  y(value: number): DeprivePoint
  y(value?: number): DepriveY | DeprivePoint {
    if (value == undefined) {
      return this._y
    }
    this._y.value = value
    return this
  }
}

export class DepriveX implements Animatable<number> {
  constructor(
    public id: number,
    public parent: DepriveObject,
    public value: number
  ) {}
  animProperty: AnimatableProperty = AnimatableProperty.X
}

export class DepriveY implements Animatable<number> {
  constructor(
    public id: number,
    public parent: DepriveObject,
    public value: number
  ) {}

  animProperty: AnimatableProperty = AnimatableProperty.Y
}
