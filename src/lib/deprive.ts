import { Animation } from './anim/animation'
import { Artboard } from './artboard'
import { Color } from './color'
import { IdGenerator } from './core'
import { Ellipse } from './shape/ellipse'
import { Fill } from './fill'
import { Point, Size } from './misc'
import { Rectangle } from './shape/rect'

export class Deprive implements IdGenerator {
  private _id: number = 0

  private artboards: Artboard[] = []
  private _animations: Animation[] = []

  artboard(name: string): Artboard {
    const artborard = new Artboard(this.nextId()).name(name)
    this.artboards.push(artborard)
    return artborard
  }

  ellipse(size: Size, position: Point): Ellipse {
    return new Ellipse(this.nextId(), null, size, position, this)
  }

  rectangle(size: Size, position: Point): Rectangle {
    return new Rectangle(this.nextId(), null, size, position, this)
  }

  fill(color: Color): Fill {
    return new Fill(this.nextId(), null, this).color(color)
  }

  nextId(): number {
    this._id += 1
    return this._id
  }

  animation(name: string): Animation {
    const animation = new Animation(this.nextId()).name(name)
    this._animations.push(animation)
    return animation
  }

  listAnimations(): Animation[] {
    return this._animations
  }

  listArtboards(): Artboard[] {
    return this.artboards
  }
}
