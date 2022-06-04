import { Animation, AnimationLine } from '../comp/anim/animation'
import { Deprive } from '../comp/deprive'
import { CompId } from '../comp/id'
import { Artboard } from '../comp/object/artboard'
import { PrimaryBone, SecondaryBone } from '../comp/object/bone'
import { Fill, SolidColorFill } from '../comp/object/fill'
import { DepriveObject, Nesting } from '../comp/object/object'
import { Rectangle, Shape } from '../comp/object/shapes'
import {
  RivAnimation,
  RivAnimationObject,
  RivAnimationProperty,
} from './model/animations'
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
    const animations = this.exportAnimations(d.getAllAnimations())

    return new Riv(exported, animations)
  }

  private exportAnimations(animations: Animation[]): RivAnimation[] {
    return animations.map((animation) => {
      return this.exportAnimation(animation)
    })
  }

  private exportAnimation(animation: Animation): RivAnimation {
    const byObject = new Map<CompId, AnimationLine<any>[]>()

    animation.lines.forEach((line) => {
      const key = line.objectId
      const lines = byObject.get(key) || []
      lines.push(line)
      byObject.set(key, lines)
    })

    let objects: RivAnimationObject[] = []

    byObject.forEach((lines, key) => {
      const properties = lines.map((line) =>
        this.exportAnimationLine(line, key)
      )
      return new RivAnimationObject(-1, properties)
    })

    return new RivAnimation(animation.name, animation.type, objects)
  }

  private exportAnimationLine(
    line: AnimationLine<any>,
    compId: CompId
  ): RivAnimationProperty {
    return new RivAnimationProperty(-1)
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

    result.splice(0, 0, {
      parentId: -1,
      object: new RivBlackBoard(),
    })

    return result
  }
}

class Tree<A> {
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
