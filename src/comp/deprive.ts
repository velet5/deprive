import { IdProvider } from './id'
import { Color } from './misc/color'
import { Point } from './misc/point'
import { Size } from './misc/size'
import { Artboard } from './object/artboard'
import { Fill, SolidColorFill } from './object/fill'
import { DepriveObject, Nesting } from './object/object'
import { Rectangle } from './object/shapes'

export class Deprive {
  private idProvider = new IdProvider()

  private nestings: Nesting[] = []

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
}
