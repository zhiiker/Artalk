import User from '@/lib/user'
import EditorPlug from '../editor-plug'
import PlugKit from '../plug-kit'

export default class HeaderInputPlug extends EditorPlug {
  constructor(kit: PlugKit) {
    super(kit)

    this.kit.useEvents().on('header-input', (({ field, $input }) => {
      if (field === 'nick' || field === 'email')
        this.fetchUserInfo()
    }))

    const onLinkInputChange = () => this.onLinkInputChange()

    this.kit.useMounted(() => {
      this.kit.useUI().$link.addEventListener('change', onLinkInputChange)
    })
    this.kit.useUnmounted(() => {
      this.kit.useUI().$link.addEventListener('change', onLinkInputChange)
    })
  }

  private queryUserInfo = {
    timeout: <number|null>null,
    abortFunc: <(() => void)|null>null
  }

  /** 远程获取用户数据 */
  private fetchUserInfo() {
    User.logout()

    // 获取用户信息
    if (this.queryUserInfo.timeout) window.clearTimeout(this.queryUserInfo.timeout) // 清除待发出的请求
    if (this.queryUserInfo.abortFunc) this.queryUserInfo.abortFunc() // 之前发出未完成的请求立刻中止

    this.queryUserInfo.timeout = window.setTimeout(() => {
      this.queryUserInfo.timeout = null // 清理

      const {req, abort} = this.kit.useApi().user.userGet(
        User.data.nick, User.data.email
      )
      this.queryUserInfo.abortFunc = abort
      req.then(data => {
        if (!data.is_login) {
          User.logout()
        }

        // 未读消息更新
        this.kit.useGlobalCtx().updateNotifies(data.unread)

        // 若用户为管理员，执行登陆操作
        if (User.checkHasBasicUserInfo() && !data.is_login && data.user?.is_admin) {
          // 显示登录窗口
          this.kit.useGlobalCtx().checkAdmin({
            onSuccess: () => {}
          })
        }

        // 自动填入 link
        if (data.user && data.user.link) {
          this.kit.useUI().$link.value = data.user.link
          User.update({ link: data.user.link })
        }
      })
      .catch(() => {})
      .finally(() => {
        this.queryUserInfo.abortFunc = null // 清理
      })
    }, 400) // 延迟执行，减少请求次数
  }

  private onLinkInputChange() {
    // Link URL 自动补全协议
    const link = this.kit.useUI().$link.value.trim()
    if (!!link && !/^(http|https):\/\//.test(link)) {
      this.kit.useUI().$link.value = `https://${link}`
      User.update({ link: this.kit.useUI().$link.value })
    }
  }
}
