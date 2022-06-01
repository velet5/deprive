import * as rive from '@rive-app/canvas'
import {
  RivHeader,
  RivObject,
  RivParsingResult,
  RivProperty,
  RivTreeVisualizer,
} from './parse/RivTreeVisualizer'
import { exportRive, make } from './setup'
import './style.css'

const visualize = (elem: HTMLElement, array: Uint8Array) => {
  let parsed: RivParsingResult

  elem.innerHTML = ''

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

  const addHeader = (header: RivHeader): HTMLElement => {
    const el = document.createElement('div')
    el.classList.add('riv-header')
    el.innerText = `${header.fingerprint} ${header.major}.${header.minor} ${header.fileId}`
    return el
  }

  const addProperty = (property: RivProperty): HTMLElement => {
    const el = document.createElement('div')
    el.classList.add('riv-property')

    el.innerText = `${zpad(property.code)} ${property.type} ${property.value}`
    el.onmouseover = () => {
      el.classList.add('riv-property__hover')
      for (let i = property.start; i < property.finish; i++) {
        const el = document.getElementById(`byte-${i}`)
        if (el) {
          el.classList.add('byte-hover')
        }
      }
    }

    el.onmouseleave = () => {
      el.classList.remove('riv-property__hover')
      for (let i = property.start; i < property.finish; i++) {
        const el = document.getElementById(`byte-${i}`)
        if (el) {
          el.classList.remove('byte-hover')
        }
      }
    }
    return el
  }

  const zpad = (n: number) => {
    return n.toString(16).padStart(2, '0')
  }

  const addObject = (object: RivObject): HTMLElement => {
    const el = document.createElement('div')
    el.classList.add('riv-object')
    el.innerText = `${zpad(object.code)} ${object.type} (${zpad(object.id)})`

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

const download = (url: string) => {
  const a = document.createElement('a')
  a.id = 'download'
  a.href = url
  a.download = 'rive.riv'
  a.innerText = 'download'

  document.body.append(a)
}

const playAnimation = (canvas: HTMLElement, url: string) => {
  console.log(url)
  new rive.Rive({
    src: url,
    canvas: canvas,
    autoplay: true,
    layout: new rive.Layout({
      fit: rive.Fit.Cover,
      alignment: rive.Alignment.TopRight,
    }),
  })
}

window.addEventListener('DOMContentLoaded', () => {
  const str = document.getElementById('string')!
  const tree = document.getElementById('tree')!
  const canvas = document.getElementById('canvas')!
  const uploadInput = document.getElementById('external-riv')!

  const deprive = make()
  const bytes = exportRive(deprive)

  const go = async (blob: Blob, bytes?: Uint8Array) => {
    const url = URL.createObjectURL(blob)

    if (!bytes) {
      const buffer = await blob.arrayBuffer()
      bytes = new Uint8Array(buffer)
    }

    const arr = [] as number[]
    for (let i = 0; i < bytes.byteLength; i++) {
      arr.push(bytes[i])
    }

    const zpad = (n: number) => {
      const s = n.toString(16)
      return s.length === 1 ? '0' + s : s
    }

    str.innerHTML = ''
    let block: HTMLElement
    arr.forEach((n, index) => {
      if (index % 16 === 0) {
        block = document.createElement('div')
        str.appendChild(block)
      }
      const el = document.createElement('span')
      el.classList.add('byte')
      el.id = `byte-${index}`
      el.innerText = zpad(n)
      block.appendChild(el)
    })

    playAnimation(canvas, url)
    download(url)
    visualize(tree, bytes)
  }

  go(new Blob([bytes], { type: 'application/rive' }), bytes)

  uploadInput.onchange = (e) => {
    const file = (<HTMLInputElement>e.target).files![0]

    go(file)
  }
})
