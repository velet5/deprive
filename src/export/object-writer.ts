import {
  RivArtboard,
  RivBlackBoard,
  RivBone,
  RivBoneBase,
  RivExportedObject,
  RivFill,
  RivRectangle,
  RivShape,
  RivSolidColor,
} from './model/objects'
import { Buffer } from './util/buffer'
import { Angle } from './util/conver'

const objectId = {
  artboard: 0x01,
  shape: 0x03,
  rectangle: 0x07,
  solidColor: 0x12,
  fill: 0x14,
  blackBoard: 0x17,
  boneBase: 0x28,
  bone: 0x29,
}

const propId = {
  parent: 0x05,
  artboardWidth: 0x07,
  artboardHeight: 0x08,
  shapeX: 0x0d,
  shapeY: 0x0e,
  rotation: 0x0f,
  shapeWidth: 0x14,
  shapeHeight: 0x15,
  colorValue: 0x25,
  boneLength: 0x59,
  boneX: 0x5a,
  boneY: 0x5b,
}

export class ObjectWriter {
  constructor() {}

  write(buffer: Buffer, objects: RivExportedObject[]) {
    objects.forEach((object) => this.writeObject(buffer, object))
  }

  private writeObject(buffer: Buffer, exported: RivExportedObject) {
    const parentId = exported.parentId
    const object = exported.object

    console.log(
      `Exporting object ${object.constructor.name}: ${parentId}`,
      object
    )

    if (object instanceof RivBlackBoard) {
      this.writeBlackBoard(buffer)
      return
    }

    if (object instanceof RivArtboard) {
      this.writeArtboard(buffer, object)
      return
    }

    if (object instanceof RivShape) {
      this.writeShape(buffer, parentId, object)
      return
    }

    if (object instanceof RivRectangle) {
      this.writeRectangle(buffer, parentId, object)
      return
    }

    if (object instanceof RivSolidColor) {
      this.writeSolidColor(buffer, parentId, object)
      return
    }

    if (object instanceof RivFill) {
      this.writeFill(buffer, parentId)
      return
    }

    if (object instanceof RivBoneBase) {
      this.writeBoneBase(buffer, parentId, object)
      return
    }

    if (object instanceof RivBone) {
      this.writeBone(buffer, parentId, object)
      return
    }

    throw new Error(`Object ${object.constructor.name} is not supported`)
  }

  private writeBlackBoard(buffer: Buffer) {
    buffer.addByte(objectId.blackBoard)
    buffer.addZero()
  }

  private writeArtboard(buffer: Buffer, artboard: RivArtboard) {
    buffer.addByte(objectId.artboard)
    buffer.addByte(propId.artboardWidth)
    buffer.addFloat(artboard.width)
    buffer.addByte(propId.artboardHeight)
    buffer.addFloat(artboard.height)
    buffer.addZero()
  }

  private writeShape(buffer: Buffer, parentId: number, shape: RivShape) {
    buffer.addByte(objectId.shape)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    buffer.addByte(propId.shapeX)
    buffer.addFloat(shape.x)
    buffer.addByte(propId.shapeY)
    buffer.addFloat(shape.y)
    buffer.addZero()
  }

  private writeRectangle(
    buffer: Buffer,
    parentId: number,
    rectangle: RivRectangle
  ) {
    buffer.addByte(objectId.rectangle)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    buffer.addByte(propId.shapeWidth)
    buffer.addFloat(rectangle.width)
    buffer.addByte(propId.shapeHeight)
    buffer.addFloat(rectangle.height)
    buffer.addZero()
  }

  private writeSolidColor(
    buffer: Buffer,
    parentId: number,
    solidColor: RivSolidColor
  ) {
    buffer.addByte(objectId.solidColor)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    buffer.addByte(propId.colorValue)
    buffer.addByte(solidColor.b)
    buffer.addByte(solidColor.g)
    buffer.addByte(solidColor.r)
    buffer.addByte(Math.floor((solidColor.a / 100) * 255))
    buffer.addZero()
  }

  private writeFill(buffer: Buffer, parentId: number) {
    buffer.addByte(objectId.fill)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    buffer.addZero()
  }

  private writeBoneBase(
    buffer: Buffer,
    parentId: number,
    boneBase: RivBoneBase
  ) {
    buffer.addByte(objectId.boneBase)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    if (boneBase.rotation != 0) {
      buffer.addByte(propId.rotation)
      buffer.addFloat(Angle.toRadians(boneBase.rotation))
    }
    buffer.addByte(propId.boneLength)
    buffer.addFloat(boneBase.length)
    buffer.addZero()
  }

  private writeBone(buffer: Buffer, parentId: number, bone: RivBone) {
    buffer.addByte(objectId.bone)
    buffer.addByte(propId.parent)
    buffer.addByte(parentId)
    buffer.addByte(propId.boneX)
    buffer.addFloat(bone.x)
    buffer.addByte(propId.boneY)
    buffer.addFloat(bone.y)
    if (bone.rotation != 0) {
      buffer.addByte(propId.rotation)
      buffer.addFloat(Angle.toRadians(bone.rotation))
    }
    buffer.addByte(propId.boneLength)
    buffer.addFloat(bone.length)
    buffer.addZero()
  }
}
