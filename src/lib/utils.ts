import libMarked from 'marked'
import hanabi from 'hanabi'
import Context from '../Context'

export function createElement<E extends HTMLElement = HTMLElement> (htmlStr: string = ''): E {
  const div = document.createElement('div')
  div.innerHTML = htmlStr.trim()
  return (div.firstElementChild || div) as E
}

export function getHeight (el: HTMLElement) {
  return parseFloat(getComputedStyle(el, null).height.replace('px', ''))
}

export function htmlEncode (str: string) {
  const temp = document.createElement('div')
  temp.innerText = str
  const output = temp.innerHTML
  return output
}

export function htmlDecode (str: string) {
  const temp = document.createElement('div')
  temp.innerHTML = str
  const output = temp.innerText
  return output
}

export function getQueryParam (name: string) {
  const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

export function getOffset (el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  }
}

export function padWithZeros (vNumber: number, width: number) {
  let numAsString = vNumber.toString()
  while (numAsString.length < width) {
    numAsString = `0${numAsString}`
  }
  return numAsString
}

export function dateFormat (date: Date) {
  const vDay = padWithZeros(date.getDate(), 2)
  const vMonth = padWithZeros(date.getMonth() + 1, 2)
  const vYear = padWithZeros(date.getFullYear(), 2)
  // var vHour = padWithZeros(date.getHours(), 2);
  // var vMinute = padWithZeros(date.getMinutes(), 2);
  // var vSecond = padWithZeros(date.getSeconds(), 2);
  return `${vYear}-${vMonth}-${vDay}`
}

export function timeAgo (date: Date) {
  try {
    const oldTime = date.getTime()
    const currTime = new Date().getTime()
    const diffValue = currTime - oldTime

    const days = Math.floor(diffValue / (24 * 3600 * 1000))
    if (days === 0) {
      // 计算相差小时数
      const leave1 = diffValue % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
      const hours = Math.floor(leave1 / (3600 * 1000))
      if (hours === 0) {
        // 计算相差分钟数
        const leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
        const minutes = Math.floor(leave2 / (60 * 1000))
        if (minutes === 0) {
          // 计算相差秒数
          const leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
          const seconds = Math.round(leave3 / 1000)
          return `${seconds} 秒前`
        }
        return `${minutes} 分钟前`
      }
      return `${hours} 小时前`
    }
    if (days < 0) return '刚刚'

    if (days < 8) {
      return `${days} 天前`
    }

    return dateFormat(date)
  } catch (error) {
    console.error(error)
    return ' - '
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let markedInstance: any = null
export function marked (ctx: Context, src: string): string {
  if (!markedInstance) {
    const renderer = new libMarked.Renderer()
    const linkRenderer = renderer.link
    renderer.link = (href, title, text) => {
      const html = linkRenderer.call(renderer, href, title, text)
      return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ')
    }

    const nMarked = libMarked
    nMarked.setOptions({
      renderer,
      highlight: (code) => hanabi(code),
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: true,
      sanitize: true, // 净化
      smartLists: true,
      smartypants: true,
      xhtml: false
    })

    markedInstance = nMarked
  }

  return markedInstance(src)

  return ''
}
