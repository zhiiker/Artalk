import './PreviewPlug.less'

import Editor from '../Editor'
import EditorPlug from './EditorPlug'
import * as Utils from '~/src/lib/utils'

export default class PreviewPlug extends EditorPlug {
  el!: HTMLElement
  binded: boolean = false

  constructor (editor: Editor) {
    super(editor)

    this.initEl()
  }

  initEl () {
    this.el = Utils.createElement('<div class="atk-editor-plug-preview"></div>')
    this.binded = false
  }

  getName () {
    return 'preview'
  }

  getBtnHtml () {
    return '预览 <i title="Markdown is supported"><svg class="markdown" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z"></path></svg></i>'
  }

  getEl () {
    return this.el
  }

  onShow () {
    this.updateContent()
    if (!this.binded) {
      const event = () => {
        this.updateContent()
      }
      this.editor.textareaEl.addEventListener('input', event)
      this.editor.textareaEl.addEventListener('change', event)
      this.binded = true
    }
  }

  onHide () {}

  updateContent () {
    if (this.el.style.display !== 'none') {
      this.el.innerHTML = this.editor.getContentMarked()
    }
  }
}
