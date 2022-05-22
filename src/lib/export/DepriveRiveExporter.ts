import { Leb128 } from '../../util/leb128'
import { Artboard } from '../artboard'
import { DepriveObjectType } from '../core'
import { Deprive } from '../deprive'
import { Fill } from '../fill'
import { DepriveExporter } from './DepriveExporter'
import { Animation, AnimationType } from '../anim/animation'
import { Color } from '../color'

const ids = {
  artboard: 0x01,
  solidColor: 0x12,
  blackboard: 0x17,
  fill: 0x14,
  keyedObject: 0x19,
  keyedProperty: 0x1a,
  linearAnimation: 0x1f,
}

const properties = {
  name: 0x04,
  parentId: 0x05,
  width: 0x07,
  height: 0x08,
  colorValue: 0x25,
  keyedObjectId: 0x33,
  keyedPropertyProperty: 0x35,
  animationName: 0x37,
  animationType: 0x3b,
  frame: 0x43,
  interpolationType: 0x44,
}

const keyframes = {
  color: 0x25,
  colorValue: 0x58,
}

const interpolation = {
  linear: 0x01,
}

const animation_type = {
  loop: 0x01,
  pingPong: 0x02,
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

    deprive
      .listAnimations()
      .forEach((animation) => this.writeAnimation(buffer, animation))

    return buffer.toUint8Array()
  }

  private writeAnimation(buffer: Buffer, animation: Animation): void {
    buffer.write(ids.linearAnimation)
    buffer.write(properties.animationName)
    buffer.writeString(animation._name)

    switch (animation._type) {
      case AnimationType.Loop:
        buffer.write(properties.animationType)
        buffer.write(animation_type.loop)
        break
      case AnimationType.PingPong:
        buffer.write(properties.animationType)
        buffer.write(animation_type.pingPong)
        break
      default:
        break
    }

    buffer.writeZero()

    animation._lines.forEach((line) => {
      buffer.write(ids.keyedObject)
      buffer.write(properties.keyedObjectId)
      buffer.write(0x01)
      buffer.writeZero()
      buffer.write(ids.keyedProperty)
      buffer.write(properties.keyedPropertyProperty)
      buffer.write(properties.colorValue)
      buffer.writeZero()
      line.keys.forEach((key) => {
        buffer.write(keyframes.color)
        if (key.frame != 0) {
          buffer.write(properties.frame)
          buffer.writeVarUint(key.frame)
        }
        buffer.write(properties.interpolationType)
        buffer.write(interpolation.linear)
        buffer.write(keyframes.colorValue)
        this.writeColorValue(buffer, key.value as Color)

        buffer.writeZero()
      })
    })
  }

  private writeColorValue(buffer: Buffer, color: Color): void {
    buffer.write(color.b)
    buffer.write(color.g)
    buffer.write(color.r)
    buffer.write(Math.floor((color.a / 100) * 255))
  }

  private writeFill(buffer: Buffer, fill: Fill): void {
    buffer.write(ids.solidColor)

    buffer.write(properties.parentId)
    buffer.writeVarUint(0x02) // FIXME

    const color = fill.getColor()
    buffer.write(properties.colorValue)
    this.writeColorValue(buffer, color)
    buffer.writeZero()

    buffer.write(ids.fill)
    buffer.write(properties.parentId)
    buffer.write(0x00) // FIXME
  }

  private writeArtboard(buffer: Buffer, artboard: Artboard): void {
    buffer.write(ids.artboard)
    buffer.write(properties.name)
    buffer.writeString(artboard._name)

    this.writeWidth(buffer, artboard._size.width)
    this.writeHeight(buffer, artboard._size.height)

    buffer.writeZero()
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
