import { Deprive } from '../comp/deprive'
import { CompId } from '../comp/id'
import { DepriveObject, Nesting } from '../comp/object/object'
import { RivArtboard, RivBlackBoard } from './model/objects'
import { Riv } from './model/riv'

export class Untangler {
  untangle(d: Deprive): Riv {
    const nestings = d.getAllNestings()
    const id2object = this.makeIdToObjectMap(nestings)
    const child2parent = this.makeChildToParentMap(nestings)

    console.log(id2object)

    return new Riv([new RivBlackBoard(), new RivArtboard(1000, 1000)])
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
}
