import { Deprive } from '../comp/deprive'
import { CompId } from '../comp/id'
import { Artboard } from '../comp/object/artboard'
import { DepriveObject, Nesting } from '../comp/object/object'
import { RivObject } from '../parse/RivTreeVisualizer'
import {
  RivArtboard,
  RivBlackBoard,
  RivExportedObject,
  RivFill,
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
    const exported = this.assignFinalIds(intermediate)

    return new Riv(exported)
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
    return []
  }

  private assignFinalIds(entries: IntermediateEntry[]): RivExportedObject[] {
    return []
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
