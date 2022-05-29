import { FramValueType } from './animatable'

export class AnimationKey<A> {
  constructor(
    public frame: number,
    public value: A,
    public valueType: FramValueType
  ) {}
}
