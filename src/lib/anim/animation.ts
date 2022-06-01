import { DepriveEntity } from '../core'
import { AnimationKey } from './key'
import { AnimationLine } from './line'
import { Animatable, AnimatableProperty, FramValueType } from './animatable'

export enum AnimationType {
  OneShot = 1,
  PingPong,
  Loop,
}

export class Animation implements DepriveEntity {
  id: number

  static DefaultDuration = 1000
  static DefaultSnapKeys = 60

  parent = null

  _name: string = 'animation'
  _duration: number = Animation.DefaultDuration
  _snapKeys: number = Animation.DefaultSnapKeys
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

  line<A>(prop: Animatable<A>, keys: { [key: number]: A }): Animation {
    let frameValueType: FramValueType
    switch (prop.animProperty) {
      case AnimatableProperty.X:
      case AnimatableProperty.Y:
        frameValueType = FramValueType.Double
        break
      default:
        throw new Error(
          `No support for animatable property ${prop.animProperty}`
        )
    }

    let animKeys = [] as AnimationKey<A>[]

    for (const prop in keys) {
      const frame = Number(prop)
      const value = keys[prop]
      console.log(frame, value)
      animKeys.push(new AnimationKey(frame, value, frameValueType))
    }

    this._lines.push(new AnimationLine(prop, animKeys))
    return this
  }
}
