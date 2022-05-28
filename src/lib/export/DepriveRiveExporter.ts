import { Leb128 } from '../../util/leb128'
import { Artboard } from '../artboard'
import { DepriveEntity, DepriveObject, DepriveObjectType } from '../core'
import { Deprive } from '../deprive'
import { Fill } from '../fill'
import { DepriveExporter } from './DepriveExporter'
import { Animation, AnimationType } from '../anim/animation'
import { Color, DepriveColor } from '../color'

const ids = {
  artboard: 0x01,
  shape: 0x03,
  ellipse: 0x04,
  rectangle: 0x07,
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
    return new ExportImpl(deprive).export()
  }
}

class ExportImpl {
  private id2id: { [id: number]: number } = {}

  private order: DepriveEntity[] = []

  private buffer = new Buffer()

  constructor(private deprive: Deprive) {}

  export(): Uint8Array {
    this.writeHeader()

    // blackboard (whatever that is)
    this.buffer.writeVarUint(ids.blackboard).writeVarUint(0x00)

    const entities = new Flatter(this.deprive).order()

    entities.forEach((entity, index) => {
      this.id2id[entity.id] = index
    })

    entities.forEach((entity) => {
      console.log(
        `Writing entity ${entity.id}(${this.getId(entity.id)}): ${entity.type}`
      )
      switch (entity.type) {
        case DepriveObjectType.Artboard:
          this.writeArtboard(entity as Artboard)
          break

        case DepriveObjectType.Fill:
          this.writeFill(entity as Fill)
          break

        case DepriveObjectType.SolidColor:
          this.writeSolidColor(entity as DepriveColor)
          break

        default:
          break
      }
    })

    this.buffer.writeZero()

    this.deprive
      .listAnimations()
      .forEach((animation) => this.writeAnimation(animation))

    return this.buffer.toUint8Array()
  }

  private remember(entity: DepriveEntity): void {
    const len = this.order.length
    this.order.push(entity)
    this.id2id[entity.id] = len
  }

  private writeHeader() {
    // header
    this.buffer
      .writeArray(this.fingerprint)
      .writeVarUint(this.major)
      .writeVarUint(this.minor)
      .writeVarUint(this.fileId)
      .writeZero() // header terminator
  }

  private writeAnimation(animation: Animation): void {
    const buffer = this.buffer

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
      buffer.write(this.getId(line.property.id))
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

  private writeSolidColor(color: DepriveColor): void {
    const buffer = this.buffer
    buffer.write(ids.solidColor)

    this.writeParent(color.parent?.id)

    buffer.write(properties.colorValue)
    this.writeColorValue(buffer, color)
    buffer.writeZero()
  }

  private writeColorValue(buffer: Buffer, color: Color): void {
    buffer.write(color.b)
    buffer.write(color.g)
    buffer.write(color.r)
    buffer.write(Math.floor((color.a / 100) * 255))
  }

  private writeFill(fill: Fill): void {
    const buffer = this.buffer

    buffer.write(ids.fill)
    this.writeParent(fill.parent?.id)
  }

  private writeParent(parentId: number | undefined): void {
    const id = this.getId(parentId)

    console.log(`parentId: ${parentId} - ${id}`)

    this.buffer.write(properties.parentId)
    this.buffer.write(this.getId(parentId))
  }

  private writeArtboard(artboard: Artboard): void {
    const buffer = this.buffer

    this.remember(artboard)

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

  private getId(entityId: number | undefined): number {
    if (entityId == null) {
      throw new Error('entityId is null')
    }
    return this.id2id[entityId]
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

class Flatter {
  private entities: DepriveObject[] = []

  constructor(private deprive: Deprive) {}

  order(): DepriveObject[] {
    this.deprive.listArtboards().forEach((artboard) => {
      this.remember(artboard)

      artboard._fills.forEach((fill) => {
        this.remember(fill.getColor())
        this.remember(fill)
      })
    })

    return this.entities
  }

  remember(entity: DepriveObject) {
    this.entities.push(entity)
  }
}
