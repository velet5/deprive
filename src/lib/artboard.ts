import { DepriveObject, DepriveObjectType } from './core'
import { Ellipse } from './shape/ellipse'
import { Fill } from './fill'
import { Origin, Point, Size } from './misc'
import { Shape } from './shape/shape'
import { Rectangle } from './shape/rect'

export class Artboard implements DepriveObject {
  id: number
  type: DepriveObjectType = DepriveObjectType.Artboard
  parent: DepriveObject | null = null

  _name: string = 'Artboard'
  _position: Point = new Point(0, 0)
  _size: Size = new Size(1000, 1000)
  _origin: Origin = new Origin(0, 0)
  _mainArtboard: boolean = false
  _clip: boolean = true
  _fills: Fill[] = []

  _shapes: Shape[] = []

  constructor(id: number) {
    this.id = id
  }

  name(name: string): Artboard {
    this._name = name
    return this
  }

  position(position: Point): Artboard {
    this._position = position
    return this
  }

  size(size: { width: number; height: number }): Artboard {
    this._size = size
    return this
  }

  origin(origin: Origin): Artboard {
    this._origin = origin
    return this
  }

  mainArtboard(mainArtboard: boolean): Artboard {
    this._mainArtboard = mainArtboard
    return this
  }

  clip(clip: boolean): Artboard {
    this._clip = clip
    return this
  }

  fill(fill: Fill): Artboard {
    fill.parent = this
    this._fills.push(fill)
    return this
  }

  ellipse(ellipse: Ellipse): Artboard {
    ellipse.parent = this
    this._shapes.push(ellipse)
    return this
  }

  rectangle(rectangle: Rectangle): Artboard {
    rectangle.parent = this
    this._shapes.push(rectangle)
    return this
  }
}
