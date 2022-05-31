export class RivTreeVisualizer {
  private position: number = 0

  constructor(private array: Uint8Array) {}

  public parse(): RivParsingResult {
    let objects = []
    try {
      const header = this.parseHeader()

      let index = 0
      while (this.position < this.array.length) {
        const object = this.parseObject(header.toc, index)
        objects.push(object)
        if (object.type != RivObjectType.Blackboard) {
          index += 1
        }
      }

      return new RivParsingResult(header, objects)
    } catch (e) {
      console.log(objects)
      throw new Error(`Error parsing RIV file: ${e}`)
    }
  }

  private parseProperty(
    toc: RivToc,
    valueType: RivValueType
  ): RivProperty | null {
    const start = this.position
    const code = this.array[this.position++]

    if (code === 0) return null
    if (code === undefined) return null

    let type: RivPropertyType
    let value: RivValue
    switch (code) {
      case 0x04:
        type = RivPropertyType.Name
        value = this.parseString()
        break

      case 0x05:
        type = RivPropertyType.Parent
        value = this.readId()
        break

      case 0x07:
        type = RivPropertyType.ArtboardWidth
        value = this.parseFloat()
        break

      case 0x08:
        type = RivPropertyType.ArtboardHeight
        value = this.parseFloat()
        break

      case 0x0d:
        type = RivPropertyType.ShapeX
        value = this.parseFloat()
        break

      case 0x0e:
        type = RivPropertyType.ShapeY
        value = this.parseFloat()
        break

      case 0x0f:
        type = RivPropertyType.Rotation
        value = this.parseFloat()
        break

      case 0x14:
        type = RivPropertyType.ShapeWidth
        value = this.parseFloat()
        break

      case 0x15:
        type = RivPropertyType.ShapeHeight
        value = this.parseFloat()
        break

      case 0x18:
        type = RivPropertyType.VertexX
        value = this.parseFloat()
        break

      case 0x19:
        type = RivPropertyType.VertexY
        value = this.parseFloat()
        break

      case 0x1f:
        type = RivPropertyType.CornerRadiusTL
        value = this.parseFloat()
        break

      case 0x20:
        type = RivPropertyType.IsClosed
        value = this.parseByte()
        break

      case 0x25:
        type = RivPropertyType.ColorValue
        value = this.parseColor()
        break

      case 0x33:
        type = RivPropertyType.KeyedObjectId
        value = this.readId()
        break

      case 0x35:
        type = RivPropertyType.KeyedPropertyCode
        value = this.readProperty()
        break

      case 0x37:
        type = RivPropertyType.AnimationName
        value = this.parseString()
        break

      case 0x3b:
        type = RivPropertyType.LoopType
        value = this.parseEnum('loopType')
        break

      case 0x43:
        type = RivPropertyType.KeyFrameNumber
        value = this.parseUnsignedVarInt()
        break

      case 0x44:
        type = RivPropertyType.InterpolationType
        value = this.parseEnum('interpolationType')
        break

      case 0x46:
        type = RivPropertyType.FrameValue
        value = this.readValue(valueType)
        break

      case 0x59:
        type = RivPropertyType.BoneLength
        value = this.parseFloat()
        break

      case 0x5a:
        type = RivPropertyType.BoneX
        value = this.parseFloat()
        break

      case 0x5b:
        type = RivPropertyType.BoneY
        value = this.parseFloat()
        break

      case 0x5f:
        type = RivPropertyType.BoneId
        value = this.readId()
        break

      case 0x60:
        type = RivPropertyType.TendonXx
        value = this.parseFloat()
        break

      case 0x61:
        type = RivPropertyType.TendonYx
        value = this.parseFloat()
        break

      case 0x62:
        type = RivPropertyType.TendonXy
        value = this.parseFloat()
        break

      case 0x63:
        type = RivPropertyType.TendonYy
        value = this.parseFloat()
        break

      case 0x64:
        type = RivPropertyType.TendonTx
        value = this.parseFloat()
        break

      case 0x65:
        type = RivPropertyType.TendonTy
        value = this.parseFloat()
        break

      case 0x6c:
        type = RivPropertyType.Tx
        value = this.parseFloat()
        break

      case 0x6d:
        type = RivPropertyType.Ty
        value = this.parseFloat()
        break

      default:
        const customProperty = toc.get(code)

        if (customProperty == null) {
          type = RivPropertyType.Unknown
          value = new RivNumber(0)
        } else {
          type = RivPropertyType.Custom
          valueType = customProperty.valueType
          value = this.readValue(valueType)
        }
    }

    const finish = this.position

    return new RivProperty(code, type, value, start, finish)
  }

  private parseByte(): RivValue {
    const byte = this.array[this.position++]
    return new RivNumber(byte)
  }

  private readValue(valueType: RivValueType): RivValue {
    switch (valueType) {
      case RivValueType.Uint:
        return new RivNumber(this.parseUnsignedVarInt())

      case RivValueType.Float:
        return this.parseFloat()

      default:
        throw new Error(`Unsupported value type ${valueType}`)
    }
  }

  private readProperty(): RivPropertyValue {
    const byte = this.array[this.position++]
    return new RivPropertyValue(byte)
  }

  private parseEnum(name: string): RivEnum {
    const value = this.array[this.position++]
    return new RivEnum(name, value)
  }

  private parseColor(): RivColor {
    const r = this.array[this.position++]
    const g = this.array[this.position++]
    const b = this.array[this.position++]
    const a = this.array[this.position++]

    return new RivColor(r, g, b, a)
  }

  private parseFloat(): RivValue {
    const a = this.array[this.position++]
    const b = this.array[this.position++]
    const c = this.array[this.position++]
    const d = this.array[this.position++]

    const buf = new ArrayBuffer(4)
    const view = new DataView(buf)
    view.setInt8(0, a)
    view.setInt8(1, b)
    view.setInt8(2, c)
    view.setInt8(3, d)

    const v = view.getFloat32(0, true)

    return new RivFloat(v)
  }

  private readId(): RivId {
    const id = this.parseUnsignedVarInt()
    return new RivId(id)
  }

  private parseObject(toc: RivToc, index: number): RivObject {
    const start = this.position
    const code = this.array[this.position++]

    let type: RivObjectType
    let valueType: RivValueType = RivValueType.Float
    switch (code) {
      case 0x17:
        type = RivObjectType.Blackboard
        break

      case 0x01:
        type = RivObjectType.Artboard
        break

      case 0x02:
        type = RivObjectType.Node
        break

      case 0x03:
        type = RivObjectType.Shape
        break

      case 0x04:
        type = RivObjectType.Ellipse
        break

      case 0x05:
        type = RivObjectType.StraightVertex
        break

      case 0x07:
        type = RivObjectType.Rectangle
        break

      case 0x10:
        type = RivObjectType.PointsPath
        break

      case 0x12:
        type = RivObjectType.SolidColor
        break

      case 0x14:
        type = RivObjectType.Fill
        break

      case 0x19:
        type = RivObjectType.KeyedObject
        break

      case 0x1a:
        type = RivObjectType.KeyedProperty
        break

      case 0x1e:
        type = RivObjectType.KeyFrameDouble
        valueType = RivValueType.Float
        break

      case 0x1f:
        type = RivObjectType.LinearAnimation
        break

      case 0x28:
        type = RivObjectType.BoneBase
        break

      case 0x29:
        type = RivObjectType.Bone
        break

      case 0x2b:
        type = RivObjectType.Skin
        break

      case 0x2c:
        type = RivObjectType.Tendon
        break

      case 0x2d:
        type = RivObjectType.Weight
        break

      default:
        type = RivObjectType.Unknown
        break
    }

    let properties: RivProperty[] = []

    while (true) {
      const p = this.parseProperty(toc, valueType)

      if (p == null) {
        break
      }

      properties.push(p)
    }

    const finish = this.position

    return new RivObject(index, code, type, properties, start, finish)
  }

  private parseHeader(): RivHeader {
    const fingerprint = this.parseStringValue(4)
    const major = this.array[this.position++]
    const minor = this.array[this.position++]
    const fileId = this.parseUnsignedVarInt()

    let propertyKeys = []

    while (true) {
      const propertyKey = this.parseUnsignedVarInt()
      if (propertyKey === 0) {
        break
      }

      propertyKeys.push(propertyKey)
    }

    let int = 0
    let bit = 8

    const propertyToFieldIndex: { [key: number]: number } = {}

    for (let i = 0; i < propertyKeys.length; i++) {
      if (bit === 8) {
        int = this.parseUint32()
        console.log(`int: ${int.toString(16)}`)
        bit = 0
      }
      const fieldIndex = (int >>> bit) & 3
      propertyToFieldIndex[propertyKeys[i]] = fieldIndex
      bit += 2
    }

    return new RivHeader(
      fingerprint,
      major,
      minor,
      fileId,
      new RivToc(propertyToFieldIndex)
    )
  }

  private parseUint32(): number {
    const a = this.array[this.position++]
    const b = this.array[this.position++]
    const c = this.array[this.position++]
    const d = this.array[this.position++]

    const buf = new ArrayBuffer(4)
    const view = new DataView(buf)
    view.setInt8(0, a)
    view.setInt8(1, b)
    view.setInt8(2, c)
    view.setInt8(3, d)

    const v = view.getUint32(0, true)

    return v
  }

  private parseUnsignedVarInt(): number {
    let result = 0
    let shift = 0
    let byte: number
    do {
      byte = this.array[this.position++]
      result |= (byte & 0x7f) << shift
      shift += 7
    } while (byte & 0x80)
    return result
  }

  private parseString(): RivString {
    const len = this.array[this.position++]
    const value = this.parseStringValue(len)

    return new RivString(value)
  }

  private parseStringValue(len: number): string {
    let result = ''

    for (let i = 0; i < len; i++) {
      result += String.fromCharCode(this.array[this.position++])
    }

    return result
  }
}

export class RivParsingResult {
  constructor(public header: RivHeader, public objects: RivObject[]) {}
}

export class RivObject {
  constructor(
    readonly id: number,
    public code: number,
    public type: RivObjectType,
    public properties: RivProperty[],
    readonly start: number,
    readonly finish: number
  ) {}
}

export class RivProperty {
  constructor(
    public code: number,
    public type: RivPropertyType,
    public value: RivValue,
    readonly start: number,
    readonly finish: number
  ) {}
}

export class RivHeader {
  public constructor(
    public fingerprint: string,
    public major: number,
    public minor: number,
    public fileId: number,
    readonly toc: RivToc
  ) {}
}

export interface RivValue {}

export class RivPropertyValue implements RivValue {
  public constructor(public value: number) {}

  public toString(): string {
    return this.value.toString(16).padStart(2, '0')
  }
}

export class RivFloat implements RivValue {
  constructor(public value: number) {}

  public toString(): string {
    return `${this.value.toFixed(2)}`
  }
}

export class RivNumber implements RivValue {
  constructor(public value: number) {}

  public toString(): string {
    return `${this.value}`
  }
}

export class RivString implements RivValue {
  constructor(public value: string) {}

  public toString(): string {
    return `"${this.value}"`
  }
}

export class CustomProperty {
  constructor(readonly code: number, readonly valueType: RivValueType) {}
}

export class RivToc {
  constructor(public toc: { [key: number]: number }) {}

  get(code: number): CustomProperty | null {
    const v = this.toc[code]

    if (v == undefined) return null

    let valueType: RivValueType
    switch (v) {
      case 0:
        valueType = RivValueType.Uint
        break

      case 1:
        valueType = RivValueType.String
        break

      case 2:
        valueType = RivValueType.Float
        break
      case 3:
        valueType = RivValueType.Color
        break

      default:
        throw new Error(`Unknown value type ${v}`)
    }

    return new CustomProperty(code, valueType)
  }
}

export class RivEnum implements RivValue {
  constructor(public enumName: string, public value: number) {}

  public toString(): string {
    return `${this.enumName}(${this.value})`
  }
}

export class RivId implements RivValue {
  constructor(public value: number) {}

  public toString(): string {
    return `${this.value.toString(16).padStart(2, '0')}`
  }
}

export class RivColor implements RivValue {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number
  ) {}

  public toString(): string {
    return `#${this.toHex(this.r)}${this.toHex(this.g)}${this.toHex(this.b)} (${
      this.a
    })`
  }

  private toHex(v: number): string {
    return v.toString(16).padStart(2, '0')
  }
}

export enum RivObjectType {
  Blackboard = 'blackboard',
  Artboard = 'artboard',
  Shape = 'shape',
  Ellipse = 'ellipse',
  Fill = 'fill',
  SolidColor = 'solidColor',
  LinearAnimation = 'linearAnimation',
  KeyedObject = 'keyedObject',
  KeyedProperty = 'keyedProperty',
  KeyFrameDouble = 'keyFrameDouble',
  Unknown = 'unknown',
  Node = 'Node',
  Rectangle = 'Rectangle',
  Bone = 'Bone',
  BoneBase = 'BoneBase',
  PointsPath = 'PointsPath',
  StraightVertex = 'StraightVertex',
  Component = 'Component',
  Skin = 'Skin',
  Weight = 'Weight',
  Tendon = 'Tendon',
}

export enum RivPropertyType {
  Name = 'name',
  AnimationName = 'animationName',
  ArtboardWidth = 'artboardWidth',
  ArtboardHeight = 'artboardHeight',
  ShapeWidth = 'shapeWidth',
  ShapeHeight = 'shapeHeight',
  ShapeX = 'shapeX',
  ShapeY = 'shapeY',
  Parent = 'parent',
  LoopType = 'loopType',
  KeyFrameNumber = 'keyFrameNumber',
  KeyedObjectId = 'keyedObjectId',
  KeyedPropertyCode = 'keyedPropertyCode',
  InterpolationType = 'interpolationType',
  FrameValue = 'frameValue',
  Frame = 'frame',
  Unknown = 'unknown',
  ColorValue = 'colorValue',
  Custom = 'Custom',
  CornerRadiusTL = 'cornerRadiusTL',
  Rotation = 'Rotation',
  BoneLength = 'BoneLength',
  BoneY = 'BoneY',
  IsClosed = 'IsClosed',
  VertexX = 'VertexX',
  VertexY = 'VertexY',
  BoneX = 'BoneX',
  Tx = 'Tx',
  Ty = 'Ty',
  BoneId = 'BoneId',
  TendonXx = 'TendonXx',
  TendonYx = 'TendonYx',
  TendonXy = 'TendonXy',
  TendonYy = 'TendonYy',
  TendonTx = 'TendonTx',
  TendonTy = 'TendonTy',
}

export enum RivValueType {
  Uint = 'uint',
  Float = 'float',
  String = 'string',
  Color = 'color',
}
