import type { CommentData } from '~/types/artalk-data'
import type EditorApi from '~/types/editor'
import type Context from '~/types/context'
import Component from '../lib/component'
import * as Ui from '../lib/ui'
import marked from '../lib/marked'
import { render, EditorUI } from './ui'
import PlugManager from './plug-manager'
import MoverPlug from './core/mover-plug'
import ReplyPlug from './core/reply-plug'
import EditPlug from './core/edit-plug'
import SubmitPlug from './core/submit-plug'
import ClosablePlug from './core/closable-plug'

class Editor extends Component implements EditorApi {
  private ui: EditorUI
  getUI() { return this.ui }

  private plugs?: PlugManager
  getPlugs() { return this.plugs }

  constructor(ctx: Context) {
    super(ctx)

    // init editor ui
    this.ui = render()
    this.$el = this.ui.$el

    // event listen
    this.ctx.on('conf-loaded', () => {
      // trigger unmount event will call all plugs' unmount function
      // (this will only be called while conf reloaded, not be called at first time)
      this.plugs?.getEvents().trigger('unmounted')

      // initialize editor plugs
      this.plugs = new PlugManager(this)

      // trigger event for plug initialization
      this.plugs.getEvents().trigger('mounted')
    })
  }

  getHeaderInputEls() {
    return { nick: this.ui.$nick, email: this.ui.$email, link: this.ui.$link }
  }

  getContentFinal() {
    let content = this.getContentRaw()

    // plug hook: final content transformer
    if (this.plugs) content = this.plugs.getTransformedContent(content)

    return content
  }

  getContentRaw() {
    return this.ui.$textarea.value || ''
  }

  getContentMarked() {
    return marked(this.ctx, this.getContentFinal())
  }

  setContent(val: string) {
    this.ui.$textarea.value = val

    // plug hook: content updated
    this.plugs?.getEvents().trigger('content-updated', val)
  }

  insertContent(val: string) {
    if ((document as any).selection) {
      this.ui.$textarea.focus();
      (document as any).selection.createRange().text = val
      this.ui.$textarea.focus()
    } else if (this.ui.$textarea.selectionStart || this.ui.$textarea.selectionStart === 0) {
      const sStart = this.ui.$textarea.selectionStart
      const sEnd = this.ui.$textarea.selectionEnd
      const sT = this.ui.$textarea.scrollTop
      this.setContent(this.ui.$textarea.value.substring(0, sStart) + val + this.ui.$textarea.value.substring(sEnd, this.ui.$textarea.value.length))
      this.ui.$textarea.focus()
      this.ui.$textarea.selectionStart = sStart + val.length
      this.ui.$textarea.selectionEnd = sStart + val.length
      this.ui.$textarea.scrollTop = sT
    } else {
      this.ui.$textarea.focus()
      this.ui.$textarea.value += val
    }
  }

  focus() {
    this.ui.$textarea.focus()
  }

  reset() {
    this.setContent('')
    this.cancelReply()
    this.cancelEditComment()
  }

  resetUI() {
    // move editor to the initial position
    this.plugs?.get(MoverPlug)?.back()
  }

  setReply(commentData: CommentData, $comment: HTMLElement, scroll = true) {
    this.plugs?.get(ReplyPlug)?.setReply(commentData, $comment, scroll)
  }

  cancelReply() {
    this.plugs?.get(ReplyPlug)?.cancelReply()
  }

  setEditComment(commentData: CommentData, $comment: HTMLElement) {
    this.plugs?.get(EditPlug)?.edit(commentData, $comment)
  }

  cancelEditComment() {
    this.plugs?.get(EditPlug)?.cancelEdit()
  }

  showNotify(msg: string, type: any) {
    Ui.showNotify(this.ui.$notifyWrap, msg, type)
  }

  showLoading() {
    Ui.showLoading(this.ui.$el)
  }

  hideLoading() {
    Ui.hideLoading(this.ui.$el)
  }

  async submit() {
    const submitPlug = this.plugs?.get(SubmitPlug)
    if (!submitPlug) throw Error('submitManger not initialized')
    await submitPlug.do()
  }

  close() {
    this.plugs?.get(ClosablePlug)?.close()
  }

  open() {
    this.plugs?.get(ClosablePlug)?.open()
  }
}

export default Editor
