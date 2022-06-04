import { Buffer } from './util/buffer'

export class AnimationWriter {
  constructor() {}

  write(buffer: Buffer) {
    buffer.addByte(0x1f)
    buffer.addZero()
  }
}
