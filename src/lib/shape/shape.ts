import { Color } from '../color'
import { DepriveObject } from '../core'
import { Fill } from '../fill'
import { DeprivePoint } from '../wrap/deprive-point'

export interface Shape extends DepriveObject {
  fill(): Fill
  position(): DeprivePoint
}

export const Shape = {
  defaultColor: Color.fromHex('#747474'),
}
