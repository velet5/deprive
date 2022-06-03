import { CompId } from '../id'

export interface Identifiable {
  readonly id: CompId
}

export interface DepriveObject extends Identifiable {}

export class Nesting {
  constructor(
    readonly parent: DepriveObject,
    readonly children: DepriveObject[]
  ) {}

  add(child: DepriveObject): Nesting {
    const index = this.children.findIndex((c) => c.id.value === child.id.value)
    if (index == -1) {
      this.children.push(child)
    } else {
      this.children[index] = child
    }
    return this
  }

  addAll(children: DepriveObject[]): Nesting {
    children.forEach((child) => this.add(child))
    return this
  }
}
