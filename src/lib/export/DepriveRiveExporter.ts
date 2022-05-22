import { Deprive } from '../deprive'
import { DepriveExporter } from './DepriveExporter'

import { Leb128 } from '../../util/leb128'

export class DepriveRiveExporter implements DepriveExporter {
  export(deprive: Deprive): Uint8Array {
    const buffer = new Buffer()

    buffer
      .writeArray(this.fingerprint)
      .writeVarUint(this.major)
      .writeVarUint(this.minor)
      .writeVarUint(1337)

    return buffer.toUint8Array()
  }

  private fingerprint = [0x52, 0x49, 0x56, 0x45]
  private major = 7
  private minor = 0
  private fileId = 1337
}

class Buffer {
  private buffer: number[] = []

  writeVarUint(n: number) {
    const bytes = Leb128.encodeUnsigned(n)
    this.writeArray(bytes)
    return this
  }

  writeString(s: string) {}

  writeFloat(f: number) {}

  writeBoolean(b: boolean) {}

  writeArray(a: number[] | Uint8Array): Buffer {
    console.log('!')
    a.forEach((n) => {
      console.log('n', n)
      this.buffer.push(n)
    })
    return this
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer)
  }
}
