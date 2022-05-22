import { Animatable } from './animatable'

export class AnimationValue<P extends Animatable<V>, V> {
  private _property: P
  private _value: V
}
