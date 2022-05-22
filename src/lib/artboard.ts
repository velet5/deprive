import { Color } from './color'
import { DepriveObject, DepriveObjectType, IdGenerator } from './core'
import { Fill } from './fill'
import { Origin, Point, Size } from './misc'

export class Artboard implements DepriveObject {
  private _generator: IdGenerator

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

  constructor(id: number, generator: IdGenerator) {
    this.id = id
    this._generator = generator
  }

  name(name: string): Artboard {
    this._name = name
    return this
  }

  position(position: Point): Artboard {
    this._position = position
    return this
  }

  size(size: Size): Artboard {
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
    fill.object = this
    this._fills.push(fill)
    return this
  }
}
