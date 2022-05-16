import './style.css'

import * as monaco from 'monaco-editor'
import * as rive from '@rive-app/canvas'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

const w: any = self

w.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

const readFile = (element: HTMLInputElement, cb: (url: string) => void) => {
  const file = element.files?.item(0)

  if (file == null) {
    return
  }

  const reader = new FileReader()

  reader.readAsArrayBuffer(file)

  reader.onloadend = (e) => {
    const buffer = e.target?.result as ArrayBuffer

    const url = URL.createObjectURL(new Blob([new Uint8Array(buffer)]))
    cb(url)
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const element = document.getElementById('editor')!
  const canvas = document.getElementById('canvas')!

  const playAnimation = (url: string) => {
    console.log(url)
    console.log(canvas)
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

  const editor = monaco.editor.create(element, {
    language: 'javascript',
  })

  const fileInput = document.getElementById('file-input')! as HTMLInputElement

  fileInput.addEventListener(
    'change',
    () => readFile(fileInput, playAnimation),
    false
  )
})
