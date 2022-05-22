import { Deprive } from '../deprive'
import { DepriveExporter } from './DepriveExporter'

import { Leb128 } from '../../util/leb128'
import { Artboard } from '../artboard'
import { DepriveObjectType } from '../core'

const ids = {
  artboard: 0x01,
  name: 0x04,
  width: 0x07,
  height: 0x08,
  blackboard: 0x17,
}

export class DepriveRiveExporter implements DepriveExporter {
  export(deprive: Deprive): Uint8Array {
    const buffer = new Buffer()

    // header
    buffer
      .writeArray(this.fingerprint)
      .writeVarUint(this.major)
      .writeVarUint(this.minor)
      .writeVarUint(this.fileId)
      .writeVarUint(0x00) // header terminator

    // blackboard (whatever that is)
    buffer.writeVarUint(ids.blackboard).writeVarUint(0x00)

    deprive
      .listObjects()
      .filter((o) => o.type === DepriveObjectType.Artboard)
      .forEach((artboard) => this.writeArtboard(buffer, artboard as Artboard))

    return buffer.toUint8Array()
  }

  private writeArtboard(buffer: Buffer, artboard: Artboard): void {
    buffer.write(ids.artboard)
    buffer.write(ids.name)
    buffer.writeString(artboard._name)

    this.writeWidth(buffer, artboard._size.width)
    this.writeHeight(buffer, artboard._size.height)
  }

  private writeWidth(buffer: Buffer, width: number): void {
    buffer.write(ids.width)
    buffer.writeUint(width)
  }

  private writeHeight(buffer: Buffer, height: number): void {
    buffer.write(ids.height)
    buffer.writeUint(height)
  }

  private fingerprint = [0x52, 0x49, 0x56, 0x45]
  private major = 7
  private minor = 0
  private fileId = 1337
}

class Buffer {
  private buffer: number[] = []

  write(byte: number): Buffer {
    this.buffer.push(byte)
    return this
  }

  writeUint(v: number) {
    this.buffer.push((v >> 24) & 0xff)
    this.buffer.push((v >> 16) & 0xff)
    this.buffer.push((v >> 8) & 0xff)
    this.buffer.push(v & 0xff)
  }

  writeVarUint(n: number) {
    const bytes = Leb128.encodeUnsigned(n)
    this.writeArray(bytes)
    return this
  }

  writeString(s: string) {
    this.writeVarUint(s.length)
    for (let i = 0; i < s.length; i++) {
      this.buffer.push(s.charCodeAt(i))
    }
  }

  writeFloat(f: number) {}

  writeBoolean(b: boolean) {}

  writeArray(a: number[] | Uint8Array): Buffer {
    a.forEach((n) => {
      this.buffer.push(n)
    })
    return this
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer)
  }
}
