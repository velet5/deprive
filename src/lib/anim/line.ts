import { AnimationKey } from './key'
import { Animatable } from './animatable'

export class AnimationLine<A> {
  property: Animatable<A>
  keys: AnimationKey<A>[]

  constructor(prop: Animatable<A>, keys: AnimationKey<A>[]) {
    this.property = prop
    this.keys = keys
  }
}
