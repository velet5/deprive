import { CompId } from '../id'
import { Color } from '../misc/color'
import { Identifiable } from './object'

export interface Fill extends Identifiable {}

export class SolidColorFill implements Fill {
  constructor(readonly id: CompId, readonly color: Color) {}
}
