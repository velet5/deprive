export class AnimationKey<A> {
  frame: number
  value: A

  constructor(frame: number, value: A) {
    this.frame = frame
    this.value = value
  }
}
