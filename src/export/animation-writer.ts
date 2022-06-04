import { AnimationType } from '../comp/anim/animation'
import {
  RivAnimatableProperty,
  RivAnimation,
  RivAnimationDoubleFrame,
  RivAnimationFrame,
  RivAnimationObject,
  RivAnimationProperty,
} from './model/animations'
import { Buffer } from './util/buffer'

const objectIds = {
  keyedObject: 0x19,
  keyedProperty: 0x1a,
  frameDouble: 0x1e,
  animation: 0x1f,
}

const propertyIds = {
  keyedObjectId: 0x33,
  keyedPropertyCode: 0x35,
  animationName: 0x37,
  loopType: 0x3b,
  frameNumber: 0x43,
  interpolationType: 0x44,
  doubleFrameValue: 0x46,
}

const keyedPropertyCodes = {
  rotation: 0x0f,
}

export class AnimationWriter {
  constructor() {}

  write(buffer: Buffer, animations: RivAnimation[]) {
    animations.forEach((animation) => this.writeAnimation(buffer, animation))
  }

  private writeAnimation(buffer: Buffer, animation: RivAnimation) {
    const loopType = this.convertLoopType(animation.loopType)
    const objects = animation.objects

    buffer.addByte(objectIds.animation)
    buffer.addByte(propertyIds.animationName)
    buffer.addString(animation.name)
    if (loopType != null) {
      buffer.addByte(propertyIds.loopType)
      buffer.addByte(loopType)
    }
    buffer.addZero()

    objects.forEach((object) => this.writeObject(buffer, object))
  }

  private writeObject(buffer: Buffer, object: RivAnimationObject) {
    buffer.addByte(objectIds.keyedObject)
    buffer.addByte(propertyIds.keyedObjectId)
    buffer.addVarUint(object.objectId)
    buffer.addZero()

    object.properties.forEach((property) =>
      this.writeProperty(buffer, property)
    )
  }

  private writeProperty(buffer: Buffer, property: RivAnimationProperty) {
    const code = this.property2code[property.property]

    if (code == undefined) {
      throw new Error(`Property ${property.property} is not supported`)
    }

    buffer.addByte(objectIds.keyedProperty)
    buffer.addByte(propertyIds.keyedPropertyCode)
    buffer.addByte(code)
    buffer.addZero()

    property.frames.forEach((frame) => this.writeFrame(buffer, frame))
  }

  private writeFrame(buffer: Buffer, frame: RivAnimationFrame) {
    if (frame instanceof RivAnimationDoubleFrame) {
      this.writeDoubleFrame(buffer, frame)
    }
  }

  private writeDoubleFrame(buffer: Buffer, frame: RivAnimationDoubleFrame) {
    buffer.addByte(objectIds.frameDouble)
    if (frame.frameNumber != 0) {
      buffer.addByte(propertyIds.frameNumber)
      buffer.addVarUint(frame.frameNumber)
    }
    buffer.addByte(propertyIds.interpolationType)
    buffer.addByte(frame.interpolationType)
    buffer.addByte(propertyIds.doubleFrameValue)
    buffer.addFloat(frame.value)
    buffer.addZero()
  }

  private convertLoopType(loopType: AnimationType): number | null {
    switch (loopType) {
      case AnimationType.oneShot:
        return null
      case AnimationType.loop:
        return 1
      case AnimationType.pingPong:
        return 2
    }
  }

  private property2code: { [key: number]: number } = {
    [RivAnimatableProperty.rotation]: keyedPropertyCodes.rotation,
  }
}
