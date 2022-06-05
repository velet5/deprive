import {
  AnimatableProperty,
  Animation,
  AnimationFrame,
  AnimationLine,
} from '../comp/anim/animation'
import { Deprive } from '../comp/deprive'
import { CompId } from '../comp/id'
import { Artboard } from '../comp/object/artboard'
import { PrimaryBone, SecondaryBone } from '../comp/object/bone'
import { Fill, SolidColorFill } from '../comp/object/fill'
import { DepriveObject, Nesting } from '../comp/object/object'
import { Rectangle, Shape } from '../comp/object/shapes'
import {
  RivAnimatableProperty,
  RivAnimation,
  RivAnimationDoubleFrame,
  RivAnimationFrame,
  RivAnimationObject,
  RivAnimationProperty,
  RivInterpolationType,
} from './model/animations'
import { propertyToType, RivPropertyType } from './model/meta'
import {
  RivArtboard,
  RivBlackBoard,
  RivBone,
  RivBoneBase,
  RivExportedObject,
  RivFill,
  RivObject,
  RivRectangle,
  RivShape,
  RivSolidColor,
} from './model/objects'
import { Riv } from './model/riv'

type IntermediateId = number
type IntermediateEntry = {
  id: IntermediateId
  parentId: IntermediateId
  object: RivObject
  counterpart: DepriveObject
}
type FinalTreeEntry = { id: number; compId: CompId; object: RivExportedObject }

export class Untangler {
  interId: IntermediateId = 0

  nextIntermediateId(): IntermediateId {
    return this.interId++
  }

  untangle(d: Deprive): Riv {
    const nestings = d.getAllNestings()
    const id2object = this.makeIdToObjectMap(nestings)
    const child2parent = this.makeChildToParentMap(nestings)

    const withoutParent = this.listObjectWithoutParent(id2object, child2parent)

    withoutParent.forEach((object) => {
      if (!(object instanceof Artboard)) {
        throw new Error(`object ${object.constructor.name} has no parent!`)
      }
    })

    if (withoutParent.length !== 1) {
      throw new Error(
        `Expected exactly one artboard object, but found ${withoutParent.length}`
      )
    }

    const objectTree = this.makeObjectTree(
      withoutParent[0],
      id2object,
      child2parent
    )

    const intermediate = this.intermediateExport(objectTree)
    const intermediate2final = new Map<IntermediateId, number>()
    const final2original = new Map<number, CompId>()
    intermediate.forEach((entry, index) => {
      intermediate2final.set(entry.id, index)
      final2original.set(index, entry.counterpart.id)
    })

    const exported = this.assignFinalIds(intermediate, intermediate2final)

    const finalTree = this.makeFinalTree(exported, final2original)
    const animations = this.exportAnimations(d.getAllAnimations(), finalTree)

    console.log(finalTree)

    exported.splice(0, 0, {
      parentId: -1,
      object: new RivBlackBoard(),
    })

    return new Riv(exported, animations)
  }

  private makeFinalTree(
    objects: RivExportedObject[],
    final2original: Map<number, CompId>
  ): Tree<FinalTreeEntry> {
    const arr = objects.map((object, id) => ({
      id,
      object,
      compId: final2original.get(id)!,
    }))
    const root = arr.find((entry) => entry.object.parentId == -1)!

    const tree = new Tree<FinalTreeEntry>(root)

    const grow = (tree: Tree<FinalTreeEntry>) => {
      const v = tree.value
      const children = arr.filter((entry) => entry.object.parentId === v.id)
      children.forEach((child) => {
        const childTree = new Tree(child)
        tree.add(childTree)
        grow(childTree)
      })
    }
    grow(tree)

    return tree
  }

  private findFinalIdForAnimationObject(
    compId: CompId,
    tree: Tree<FinalTreeEntry>,
    property: RivAnimatableProperty
  ): number {
    const go = (tree: Tree<FinalTreeEntry>, met: boolean): number => {
      const v = tree.value
      if (v.compId === compId) {
        if (v.object.object.meta.animatable.includes(property)) return v.id
        else {
          for (const child of tree.children) {
            const id = go(child, met)
            if (id != -1) return id
          }
          return -1
        }
      } else if (met) {
        return -1
      } else {
        for (const child of tree.children) {
          const r = go(child, met)
          if (r != -1) return r
        }
        return -1
      }
    }
    return go(tree, false)
  }

  private exportAnimations(
    animations: Animation[],
    tree: Tree<FinalTreeEntry>
  ): RivAnimation[] {
    return animations.map((animation) => {
      return this.exportAnimation(animation, tree)
    })
  }

  private exportAnimation(
    animation: Animation,
    tree: Tree<FinalTreeEntry>
  ): RivAnimation {
    const lineTuples = animation.lines.map((line) =>
      this.exportAnimationLine(line, tree)
    )

    const byObject = new Map<number, RivAnimationProperty[]>()

    lineTuples.forEach(([objectId, prop]) => {
      const arr = byObject.get(objectId)
      if (!arr) {
        byObject.set(objectId, [prop])
      } else {
        arr.push(prop)
      }
    })

    const objects: RivAnimationObject[] = []
    for (let [k, v] of byObject.entries()) {
      objects.push(new RivAnimationObject(k, v))
    }

    return new RivAnimation(animation.name, animation.type, objects)
  }

  private exportAnimationLine(
    line: AnimationLine<any>,
    tree: Tree<FinalTreeEntry>
  ): [number, RivAnimationProperty] {
    const property = this.toRivAnimatableProperty(line.property)
    const type = propertyToType.get(property)!
    const frames = line.frames.map((frame) =>
      this.exportAnimationFrame(frame, type)
    )
    const objectId = this.findFinalIdForAnimationObject(
      line.objectId,
      tree,
      property
    )

    return [objectId, new RivAnimationProperty(property, frames)]
  }

  private toRivAnimatableProperty(
    property: AnimatableProperty
  ): RivAnimatableProperty {
    switch (property) {
      case AnimatableProperty.Rotation:
        return RivAnimatableProperty.BoneRotation
      default:
        throw new Error(`Unknown animatable property: ${property}`)
    }
  }

  private exportAnimationFrame(
    frame: AnimationFrame<any>,
    type: RivPropertyType
  ): RivAnimationFrame {
    switch (type) {
      case RivPropertyType.Double:
        return new RivAnimationDoubleFrame(
          frame.frameNumber,
          frame.value as number,
          RivInterpolationType.linear
        )

      default:
        throw new Error(`Unknown property type: ${type}`)
    }
  }

  private listObjectWithoutParent(
    id2object: Map<CompId, DepriveObject>,
    child2parent: Map<CompId, CompId>
  ): DepriveObject[] {
    const result = []
    for (const parentId of child2parent.values()) {
      if (!child2parent.has(parentId)) {
        result.push(id2object.get(parentId)!)
      }
    }
    return result
  }

  private makeIdToObjectMap(nestings: Nesting[]): Map<CompId, DepriveObject> {
    const map = new Map()

    nestings.forEach((nesting) => {
      const parent = nesting.parent
      const children = nesting.children

      map.set(parent.id, parent)
      children.forEach((child) => map.set(child.id, child))
    })

    return map
  }

  private makeChildToParentMap(nestings: Nesting[]): Map<CompId, CompId> {
    const map = new Map()

    nestings.forEach((nesting) => {
      const parent = nesting.parent
      const children = nesting.children

      children.forEach((child) => {
        const v = map.get(child.id)
        if (v !== undefined) {
          throw new Error(
            `child ${child.constructor.name} already has parent ${v.constructor.name}`
          )
        }
        map.set(child.id, parent.id)
      })
    })

    return map
  }

  private makeObjectTree(
    root: DepriveObject,
    id2object: Map<CompId, DepriveObject>,
    child2parent: Map<CompId, CompId>
  ): Tree<DepriveObject> {
    const tree = new Tree<DepriveObject>(root)

    for (const [k, v] of child2parent.entries()) {
      if (v == root.id) {
        const child = id2object.get(k)
        tree.add(this.makeObjectTree(child!, id2object, child2parent))
      }
    }

    return tree
  }

  private intermediateExport(tree: Tree<DepriveObject>): IntermediateEntry[] {
    const result: IntermediateEntry[] = []

    const go = (tree: Tree<DepriveObject>, parentId: number | null) => {
      const entries = this.intermediateExportObject(
        tree.value,
        parentId == null ? -1 : parentId
      )
      result.push(...entries)
      tree.children.forEach((child) => go(child, entries[0].id))
    }

    go(tree, null)

    return result
  }

  private intermediateExportObject(
    object: DepriveObject,
    parentId: IntermediateId
  ): IntermediateEntry[] {
    if (object instanceof Artboard) {
      return this.exportArtboard(object)
    }

    if (object instanceof Rectangle) {
      return this.exportRectangle(object, parentId)
    }

    if (object instanceof PrimaryBone) {
      return [this.exportPrimaryBone(object, parentId)]
    }

    if (object instanceof SecondaryBone) {
      return [this.exportSecondaryBone(object, parentId)]
    }

    throw new Error(
      `unhandled intermediate export object ${object.constructor.name}`
    )
  }

  private exportArtboard(artboard: Artboard): IntermediateEntry[] {
    return [
      {
        id: this.nextIntermediateId(),
        parentId: -1,
        object: new RivArtboard(artboard.width, artboard.height),
        counterpart: artboard,
      },
    ]
  }

  private exportRectangle(
    rectangle: Rectangle,
    parentId: IntermediateId
  ): IntermediateEntry[] {
    const shape = this.exportShape(rectangle, parentId)

    const result: IntermediateEntry[] = [shape]
    result.push({
      id: this.nextIntermediateId(),
      parentId: shape.id,
      object: new RivRectangle(rectangle.width, rectangle.height),
      counterpart: rectangle,
    })

    rectangle.fills.forEach((fill) => {
      result.push(...this.exprortFill(fill, shape.id))
    })

    return result
  }

  private exportPrimaryBone(
    bone: PrimaryBone,
    parentId: IntermediateId
  ): IntermediateEntry {
    return {
      id: this.nextIntermediateId(),
      parentId,
      object: new RivBone(bone.x, bone.y, bone.length, bone.rotation),
      counterpart: bone,
    }
  }

  private exportSecondaryBone(
    bone: SecondaryBone,
    parentId: IntermediateId
  ): IntermediateEntry {
    return {
      id: this.nextIntermediateId(),
      parentId,
      object: new RivBoneBase(bone.length, bone.rotation),
      counterpart: bone,
    }
  }

  private exportShape(
    shape: Shape,
    parentId: IntermediateId
  ): IntermediateEntry {
    return {
      id: this.nextIntermediateId(),
      parentId: parentId,
      object: new RivShape(shape.x, shape.y),
      counterpart: shape,
    }
  }

  private exprortFill(
    fill: Fill,
    parentId: IntermediateId
  ): IntermediateEntry[] {
    const result: IntermediateEntry[] = []

    if (fill instanceof SolidColorFill) {
      const colorId = this.nextIntermediateId()
      const fillId = this.nextIntermediateId()

      result.push({
        id: colorId,
        parentId: fillId,
        object: new RivSolidColor(
          fill.color.r,
          fill.color.g,
          fill.color.b,
          fill.color.a
        ),
        counterpart: fill,
      })

      result.push({
        id: fillId,
        parentId: parentId,
        object: new RivFill(),
        counterpart: fill,
      })
    } else {
      throw new Error(`unhandled fill ${fill.constructor.name}`)
    }

    return result
  }

  private assignFinalIds(
    entries: IntermediateEntry[],
    old2new: Map<number, number>
  ): RivExportedObject[] {
    const result = entries.map((entry) => ({
      parentId: entry.parentId === -1 ? -1 : old2new.get(entry.parentId)!,
      object: entry.object,
    }))

    return result
  }
}

export class Tree<A> {
  constructor(readonly value: A, readonly children: Tree<A>[] = []) {}

  add(child: Tree<A>): Tree<A> {
    this.children.push(child)
    return this
  }

  addAll(children: Tree<A>[]): Tree<A> {
    children.forEach((child) => this.add(child))
    return this
  }
}
