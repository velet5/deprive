import * as rive from '@rive-app/canvas'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { exportRive, make } from './setup'
import './style.css'

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

window.addEventListener('DOMContentLoaded', () => {
  const element = document.getElementById('editor')!
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

  const editor = monaco.editor.create(element, {
    language: 'javascript',
    wordWrap: 'on',
  })

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

  editor.setValue(s)

  const blob = new Blob([bytes], { type: 'application/rive' })
  const url = URL.createObjectURL(blob)
  playAnimation(url)
})
