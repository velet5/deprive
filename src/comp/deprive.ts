import { AnimatableProperty, Animation, AnimationType } from './anim/animation'
import { IdProvider } from './id'
import { Color } from './misc/color'
import { Point } from './misc/point'
import { Size } from './misc/size'
import { Artboard } from './object/artboard'
import { Bone, BoneSystem, PrimaryBone, SecondaryBone } from './object/bone'
import { Fill, SolidColorFill } from './object/fill'
import { DepriveObject, Nesting } from './object/object'
import { Rectangle } from './object/shapes'
import { AnimationLine } from './anim/animation'
import { Angle } from '../export/util/conver'

export class Deprive {
  private idProvider = new IdProvider()

  private nestings: Nesting[] = []

  private animations: DepriveAnimation[] = []

  constructor() {}

  nest(parent: DepriveObject, child: DepriveObject): Deprive {
    const index = this.nestings.findIndex((n) => n.parent.id == parent.id)
    if (index === -1) {
      this.nestings.push(new Nesting(parent, [child]))
    } else {
      this.nestings[index] = new Nesting(parent, [
        ...this.nestings[index].children,
        child,
      ])
    }
    return this
  }

  nestAll(parent: DepriveObject, children: DepriveObject[]): Deprive {
    children.forEach((child) => this.nest(parent, child))

    return this
  }

  artboard(position: Point, size: Size): Artboard {
    return new Artboard(
      this.idProvider.gen(),
      position.x,
      position.y,
      size.width,
      size.height
    )
  }

  rectangle(position: Point, size: Size): Rectangle {
    return new Rectangle(
      this.idProvider.gen(),
      position.x,
      position.y,
      size.width,
      size.height
    )
  }

  solidFill(color: Color): Fill {
    return new SolidColorFill(this.idProvider.gen(), color)
  }

  getAllNestings(): Nesting[] {
    return this.nestings
  }

  getAllAnimations(): Animation[] {
    return this.animations.map((animation) => {
      const type = animation.getIsLoop()
        ? AnimationType.loop
        : animation.getIsPingPong()
        ? AnimationType.pingPong
        : AnimationType.oneShot

      return new Animation(animation.name, type, animation.getAllLines())
    })
  }

  animation(name: string): DepriveAnimation {
    const animation = new DepriveAnimation(name)
    this.animations.push(animation)
    return animation
  }

  bones(position: Point, length: number, rotation: number): PrimaryBone
  bones(
    position: Point,
    length: number,
    rotation: number,
    ...secondary: { length: number; rotation: number }[]
  ): BoneSystem
  bones(
    position: Point,
    length: number,
    rotation: number,
    ...secondary: { length: number; rotation: number }[]
  ): BoneSystem | PrimaryBone {
    const primary = new PrimaryBone(
      this.idProvider.gen(),
      position.x,
      position.y,
      length,
      rotation
    )
    if (secondary.length === 0) {
      return primary
    }

    let parentId = primary.id
    let parent: Bone = primary
    let index = 0
    const secondaries = []
    while (true) {
      const boneId = this.idProvider.gen()
      const bone = new SecondaryBone(
        boneId,
        parentId,
        secondary[index].length,
        secondary[index].rotation
      )
      secondaries.push(bone)
      this.nest(parent, bone)
      parentId = boneId
      parent = bone
      index += 1
      if (index === secondary.length) {
        break
      }
    }

    return new BoneSystem(primary, secondaries)
  }
}

export class DepriveAnimation {
  private lines: AnimationLine<any>[] = []
  private isLoop = false
  private isPingPong = false

  constructor(readonly name: string) {}

  line<A>(
    object: DepriveObject,
    property: AnimatableProperty,
    frames: { [key: number]: A }
  ) {
    const fs = []
    for (const [frameNumber, value] of Object.entries(frames)) {
      fs.push({
        frameNumber: parseInt(frameNumber),
        value: this.adaptValue(property, value),
      })
    }
    this.lines.push(new AnimationLine(object.id, property, fs))
    return this
  }

  loop() {
    this.isLoop = true
    this.isPingPong = false
    return this
  }

  pingPong() {
    this.isPingPong = true
    this.isLoop = false
    return this
  }

  getAllLines(): AnimationLine<any>[] {
    return this.lines
  }

  getIsLoop(): boolean {
    return this.isLoop
  }

  getIsPingPong(): boolean {
    return this.isPingPong
  }

  private adaptValue<A>(prop: AnimatableProperty, value: A): any {
    if (prop == AnimatableProperty.Rotation) {
      return Angle.toRadians(value as unknown as number)
    }
    return value
  }
}
