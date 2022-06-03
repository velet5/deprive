import { Leb128 } from '../../util/leb128'

export class Buffer {
  private buffer: number[]

  constructor() {
    this.buffer = []
  }

  addByte(byte: number) {
    this.buffer.push(byte & 0xff)
  }

  addBytes(bytes: number[] | Uint8Array) {
    bytes.forEach(this.addByte)
  }

  addString(string: string) {
    const bytes = string.split('').map((char) => char.charCodeAt(0))
    this.addBytes(bytes)
  }

  addFloat(float: number) {
    const fs = new Float32Array([float])
    const arr = new Uint8Array(fs.buffer)
    this.addBytes(arr)
  }

  addUint(v: number) {
    this.buffer.push((v >> 24) & 0xff)
    this.buffer.push((v >> 16) & 0xff)
    this.buffer.push((v >> 8) & 0xff)
    this.buffer.push(v & 0xff)
  }

  addVarUint(n: number) {
    const bytes = Leb128.encodeUnsigned(n)
    this.addBytes(bytes)
    return this
  }

  addZero() {
    this.addByte(0)
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer)
  }
}
