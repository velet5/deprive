import { DepriveEntity } from '../core'
import { AnimationKey } from './key'
import { AnimationLine } from './line'
import { Animatable } from './animatable'

export enum AnimationType {
  OneShot = 1,
  PingPong,
  Loop,
}

export class Animation implements DepriveEntity {
  id: number

  _name: string = 'animation'
  _duration: number = 1000
  _snapKeys: number = 60
  _type: AnimationType = AnimationType.OneShot

  _lines: AnimationLine<any>[] = []

  constructor(id: number) {
    this.id = id
  }

  name(name: string): Animation {
    this._name = name
    return this
  }

  duration(duration: number): Animation {
    this._duration = duration
    return this
  }

  snapKeys(snapKeys: number): Animation {
    this._snapKeys = snapKeys
    return this
  }

  type(type: AnimationType): Animation {
    this._type = type
    return this
  }

  oneShot(): Animation {
    this._type = AnimationType.OneShot
    return this
  }

  pingPong(): Animation {
    this._type = AnimationType.PingPong
    return this
  }

  loop(): Animation {
    this._type = AnimationType.Loop
    return this
  }

  line<A extends Animatable<A>>(
    prop: Animatable<A>,
    keys: { frame: number; value: A }[]
  ): Animation {
    this._lines.push(new AnimationLine(prop, keys))
    return this
  }
}
