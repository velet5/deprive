import { Animatable } from '../anim/animatable'
import { DepriveObject } from '../core'
import { Point } from '../misc'

export class DeprivePoint implements Animatable<Point> {
  id: number
  x: DepriveX
  y: DepriveY

  constructor(
    public parent: DepriveObject,
    position: Point,
    id: number,
    xId: number,
    yId: number
  ) {
    this.id = id
    this.x = new DepriveX(xId, parent, position.x)
    this.y = new DepriveY(yId, parent, position.y)
  }
}

export class DepriveX implements Animatable<number> {
  constructor(
    public id: number,
    public parent: DepriveObject,
    public x: number
  ) {}
}

export class DepriveY implements Animatable<number> {
  constructor(
    public id: number,
    public parent: DepriveObject,
    public y: number
  ) {}
}