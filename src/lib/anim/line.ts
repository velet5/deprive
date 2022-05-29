import { AnimationKey } from './key'
import { Animatable } from './animatable'

export class AnimationLine<A> {
  constructor(public property: Animatable<A>, public keys: AnimationKey<A>[]) {}
}
