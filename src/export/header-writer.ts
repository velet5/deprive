import { Buffer } from './util/buffer'

export class RivHeaderWriter {
  // "RIVE"
  private fingerprint = [0x52, 0x49, 0x56, 0x45]
  private major = 7
  private minor = 0

  constructor() {}

  write(buffer: Buffer, fileId: number) {
    console.log(buffer)
    buffer.addBytes(this.fingerprint)
    console.log(1)
    buffer.addVarUint(this.major)
    console.log(buffer)
    buffer.addVarUint(this.minor)
    buffer.addVarUint(fileId)
    buffer.addZero()
  }
}
