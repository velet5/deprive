import { Leb128 } from '../../util/leb128'
import { Artboard } from '../artboard'
import { DepriveObjectType } from '../core'
import { Deprive } from '../deprive'
import { Fill } from '../fill'
import { DepriveExporter } from './DepriveExporter'

const ids = {
  artboard: 0x01,
  solidColor: 0x12,
  blackboard: 0x17,
  fill: 0x14,
}

const properties = {
  name: 0x04,
  parentId: 0x05,
  width: 0x07,
  height: 0x08,
  colorValue: 0x25,
}

export class DepriveRiveExporter implements DepriveExporter {
  private idCount: number = 0

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

    // artboards
    deprive
      .listObjects()
      .filter((o) => o.type === DepriveObjectType.Artboard)
      .forEach((artboard) => this.writeArtboard(buffer, artboard as Artboard))

    // colors
    deprive
      .listObjects()
      .filter((o) => o.type === DepriveObjectType.Artboard)
      .forEach((artboard) =>
        (artboard as Artboard)._fills.forEach((fill) =>
          this.writeFill(buffer, fill)
        )
      )

    buffer.writeZero()

    return buffer.toUint8Array()
  }

  //   private exportEntities(entities: DepriveEntity[]): void {
  //     entities.forEach((entity, id) => {

  //     })
  //   }

  private writeFill(buffer: Buffer, fill: Fill): void {
    buffer.write(ids.solidColor)

    buffer.write(properties.parentId)
    buffer.writeVarUint(fill.id)

    const color = fill.getColor()
    buffer.write(properties.colorValue)
    buffer.write(color.b)
    buffer.write(color.g)
    buffer.write(color.r)
    buffer.write(Math.floor((color.a / 100) * 255))
    buffer.writeZero()
    this.idCount += 1

    buffer.write(ids.fill)
    buffer.write(properties.parentId)
    buffer.write(0x00)
  }

  private writeArtboard(buffer: Buffer, artboard: Artboard): void {
    buffer.write(ids.artboard)
    buffer.write(properties.name)
    buffer.writeString(artboard._name)

    this.writeWidth(buffer, artboard._size.width)
    this.writeHeight(buffer, artboard._size.height)

    buffer.writeZero()
    this.idCount += 1
  }

  private writeWidth(buffer: Buffer, width: number): void {
    buffer.write(properties.width)
    buffer.writeFloat(width)
  }

  private writeHeight(buffer: Buffer, height: number): void {
    buffer.write(properties.height)
    buffer.writeFloat(height)
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

  writeZero(): Buffer {
    return this.write(0x00)
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

  writeFloat(f: number) {
    const fs = new Float32Array([f])
    const arr = new Uint8Array(fs.buffer)
    this.writeArray(arr)
  }

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
