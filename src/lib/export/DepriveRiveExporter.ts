import { Leb128 } from '../../util/leb128'
import { Artboard } from '../artboard'
import { DepriveEntity, DepriveObject, DepriveObjectType } from '../core'
import { Deprive } from '../deprive'
import { Fill } from '../fill'
import { DepriveExporter } from './DepriveExporter'
import { Animation, AnimationType } from '../anim/animation'
import { Color, DepriveColor } from '../color'
import { Ellipse } from '../shape/ellipse'
import { Shape } from '../shape/shape'

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
  shapeX: 0x0d,
  shapeY: 0x0e,
  shapeWidth: 0x14,
  shapeHeight: 0x15,
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
  private order: DepriveEntity[] = []

  private buffer = new Buffer()

  constructor(private deprive: Deprive) {}

  export(): Uint8Array {
    this.writeHeader()

    // blackboard (whatever that is)
    this.buffer.writeVarUint(ids.blackboard).writeZero()

    const entities = new Flatter(this.deprive).order()

    entities.forEach(({ parentId, type, entity }) => {
      switch (type) {
        case ExportType.Artboard:
          this.writeArtboard(entity as Artboard)
          break

        case ExportType.Shape:
          this.writeShape(entity as Shape, parentId!)
          break

        case ExportType.Ellipse:
          this.writeEllipse(entity as Ellipse, parentId!)
          break

        case ExportType.Fill:
          this.writeFill(entity as Fill, parentId!)
          break

        case ExportType.SolidColor:
          this.writeSolidColor(entity as DepriveColor, parentId!)
          break
      }
    })

    this.buffer.writeZero()

    this.deprive
      .listAnimations()
      .forEach((animation) => this.writeAnimation(animation))

    return this.buffer.toUint8Array()
  }

  private writeEllipse(ellipse: Ellipse, parentId: ExportId) {
    const buffer = this.buffer

    buffer.write(ids.ellipse)
    this.writeParent(parentId)
    buffer.write(properties.shapeWidth)
    buffer.writeFloat(ellipse.size().width)
    buffer.write(properties.shapeHeight)
    buffer.writeFloat(ellipse.size().height)
    buffer.writeZero()
  }

  private writeShape(shape: Shape, parentId: ExportId) {
    const buffer = this.buffer
    buffer.write(ids.shape)

    this.writeParent(parentId)

    buffer.write(properties.shapeX)
    buffer.writeFloat(shape.position().x.x)
    buffer.write(properties.shapeY)
    buffer.writeFloat(shape.position().y.y)
    buffer.writeZero()
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

    // animation._lines.forEach((line) => {
    //   buffer.write(ids.keyedObject)
    //   buffer.write(properties.keyedObjectId)
    //   buffer.write(0x02) // FIXME
    //   buffer.writeZero()
    //   buffer.write(ids.keyedProperty)
    //   buffer.write(properties.keyedPropertyProperty)
    //   buffer.write(properties.colorValue)
    //   buffer.writeZero()
    //   line.keys.forEach((key) => {
    //     buffer.write(keyframes.color)
    //     if (key.frame != 0) {
    //       buffer.write(properties.frame)
    //       buffer.writeVarUint(key.frame)
    //     }
    //     buffer.write(properties.interpolationType)
    //     buffer.write(interpolation.linear)
    //     buffer.write(keyframes.colorValue)
    //     this.writeColorValue(buffer, key.value as Color)

    //     buffer.writeZero()
    //   })
    // })
  }

  private writeSolidColor(color: DepriveColor, parentId: ExportId): void {
    const buffer = this.buffer
    buffer.write(ids.solidColor)

    this.writeParent(parentId)

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

  private writeFill(fill: Fill, parentId: ExportId): void {
    const buffer = this.buffer

    buffer.write(ids.fill)
    this.writeParent(parentId)
  }

  private writeParent(parentId: ExportId): void {
    this.buffer.write(properties.parentId)
    this.buffer.write(parentId.id)
  }

  private writeArtboard(artboard: Artboard): void {
    const buffer = this.buffer

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

enum ExportType {
  Artboard = 0x01,
  Shape = 0x03,
  Ellipse = 0x04,
  SolidColor = 0x12,
  Fill = 0x14,
}

class ExportId {
  constructor(public id: number) {}
}

class ExportObject {
  constructor(
    public type: ExportType,
    public entity: DepriveEntity,
    public id: ExportId,
    public parentId: ExportId | null
  ) {}
}

class Flatter {
  private id: number = 0

  private nextId(): ExportId {
    return new ExportId(this.id++)
  }

  private entities: ExportObject[] = []

  constructor(private deprive: Deprive) {}

  order(): ExportObject[] {
    this.deprive.listArtboards().forEach((artboard) => {
      const fills: {
        parentId: ExportId
        fill: Fill
      }[] = []

      const exArtboard = this.remember(ExportType.Artboard, artboard)
      artboard._fills.forEach((fill) => {
        fills.push({
          parentId: exArtboard.id,
          fill,
        })
      })

      artboard._shapes.forEach((shape) => {
        const shapeExported = this.remember(ExportType.Shape, shape)
        shapeExported.parentId = exArtboard.id
        fills.push({ parentId: shapeExported.id, fill: shape.fill() })
        if (shape instanceof Ellipse) {
          const ellipseExported = this.remember(ExportType.Ellipse, shape)
          ellipseExported.parentId = shapeExported.id
        }
      })

      fills.forEach(({ parentId, fill }) => {
        const exColor = this.remember(ExportType.SolidColor, fill.getColor())
        const exFill = this.remember(ExportType.Fill, fill)
        exColor.parentId = exFill.id
        exFill.parentId = parentId
      })
    })

    return this.entities
  }

  remember(type: ExportType, entity: DepriveObject): ExportObject {
    const id = this.nextId()
    const obj = new ExportObject(type, entity, id, null)
    this.entities.push(obj)
    return obj
  }
}
