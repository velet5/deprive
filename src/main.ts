import * as rive from '@rive-app/canvas'
import {
  RiveHeader,
  RivObject,
  RivParsingResult,
  RivProperty,
  RivTreeVisualizer,
} from './parse/RivTreeVisualizer'
import { exportRive, make } from './setup'
import './style.css'

const visualize = (elem: HTMLElement, array: Uint8Array) => {
  let parsed: RivParsingResult

  try {
    parsed = new RivTreeVisualizer(array).parse()
  } catch (e) {
    if (e instanceof Error) {
      elem.innerText = e.message
    } else {
      elem.innerText = String(e)
    }
    return
  }

  const addHeader = (header: RiveHeader): HTMLElement => {
    const el = document.createElement('div')
    el.classList.add('riv-header')
    el.innerText = `${header.fingerprint} ${header.major}.${header.minor} ${header.fileId}`
    return el
  }

  const addProperty = (property: RivProperty): HTMLElement => {
    const el = document.createElement('div')
    el.classList.add('riv-property')

    el.innerText = `${zpad(property.code)} ${property.type} ${property.value}`
    return el
  }

  const zpad = (n: number) => {
    return n.toString(16).padStart(2, '0')
  }

  const addObject = (object: RivObject): HTMLElement => {
    const el = document.createElement('div')
    el.classList.add('riv-object')
    el.innerText = `${zpad(object.code)} ${object.type}`

    object.properties.forEach((property) => {
      const propEl = addProperty(property)
      el.appendChild(propEl)
    })
    return el
  }

  elem.appendChild(addHeader(parsed.header))
  parsed.objects.forEach((object) => elem.appendChild(addObject(object)))

  console.log(parsed)
}

window.addEventListener('DOMContentLoaded', () => {
  const str = document.getElementById('string')!
  const tree = document.getElementById('tree')!
  const canvas = document.getElementById('canvas')!

  const playAnimation = (url: string) => {
    console.log(url)
    new rive.Rive({
      src: url,
      canvas: canvas,
      autoplay: true,
      layout: new rive.Layout({
        fit: rive.Fit.Contain,
        alignment: rive.Alignment.Center,
      }),
    })
  }

  const download = (url: string) => {
    const a = document.createElement('a')
    a.id = 'download'
    a.href = url
    a.download = 'rive.riv'
    a.innerText = 'download'

    document.body.append(a)
  }

  const deprive = make()
  const bytes = exportRive(deprive)

  const arr = [] as number[]
  for (let i = 0; i < bytes.byteLength; i++) {
    arr.push(bytes[i])
  }

  const zpad = (n: number) => {
    const s = n.toString(16)
    return s.length === 1 ? '0' + s : s
  }

  const s = arr.map(zpad).join(' ')
  str.innerText = s

  const blob = new Blob([bytes], { type: 'application/rive' })
  const url = URL.createObjectURL(blob)
  playAnimation(url)
  download(url)

  visualize(tree, bytes)
})
