import Component, { IComponentOptions } from '../share/Component'
import stripIndent from 'licia/stripIndent'
import $ from 'licia/$'
import h from 'licia/h'
import types from 'licia/types'
import map from 'licia/map'

/** IOptions */
export interface IOptions extends IComponentOptions {
  /** Modal title. */
  title?: string
  /** Modal content. */
  content?: string | HTMLElement
  /** Modal footer. */
  footer?: string | HTMLElement
  /** Modal width. */
  width?: number
  /** Whether to show close button. */
  showClose?: boolean
}

/**
 * Create modal dialogs.
 *
 * @example
 * const container = document.getElementById('container')
 * const modal = new LunaModal(container, {
 *   title: 'This is the Title',
 *   content: 'This is the content.',
 * })
 * modal.show()
 *
 * LunaModal.alert('This is the alert content.')
 */
export default class Modal extends Component<IOptions> {
  private $title: $.$
  private $body: $.$
  private $content: $.$
  private $close: $.$
  private $footer: $.$
  constructor(container: HTMLElement, options: IOptions = {}) {
    super(container, { compName: 'modal' }, options)
    this.hide()

    this.initOptions(options, {
      title: '',
      content: '',
      footer: '',
      showClose: true,
      width: 640,
    })

    this.initTpl()
    this.$title = this.find('.title')
    this.$content = this.find('.content')
    this.$body = this.find('.body')
    this.$footer = this.find('.footer')
    this.$close = this.find('.icon-close')

    this.bindEvent()
  }
  /** Show the modal. */
  show() {
    this.render()
    this.$container.rmClass(this.c('hidden'))
  }
  /** Hide the modal. */
  hide = () => {
    this.$container.addClass(this.c('hidden'))
  }
  destroy() {
    super.destroy()
    this.$container.rmClass(this.c('hidden'))
  }
  /**
   * Like `window.alert`.
   * @static
   */
  static alert(msg: string) {
    const modal = getGlobalModal()
    const { c } = modal
    modal.setOption({
      title: '',
      content: msg,
      footer: createButtons(
        {
          OK: {
            type: 'primary',
            onclick() {
              modal.hide()
            },
          },
        },
        c
      ),
    })
    modal.show()
  }
  /**
   * Like `window.confirm`.
   * @static
   */
  static confirm(msg: string): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = getGlobalModal()
      const { c } = modal
      modal.setOption({
        title: '',
        content: msg,
        footer: createButtons(
          {
            Cancel: {
              type: 'secondary',
              onclick() {
                modal.hide()
                resolve(false)
              },
            },
            Ok: {
              type: 'primary',
              onclick() {
                modal.hide()
                resolve(true)
              },
            },
          },
          c
        ),
      })
      modal.show()
    })
  }
  /**
   * Like `window.prompt`.
   * @static
   */
  static prompt(title = '', defaultText = ''): Promise<null | string> {
    return new Promise((resolve) => {
      const modal = getGlobalModal()
      const { c } = modal
      const input = h('input' + c('.input'), {
        value: defaultText,
      }) as HTMLInputElement
      modal.setOption({
        title,
        content: input,
        footer: createButtons(
          {
            Cancel: {
              type: 'secondary',
              onclick() {
                modal.hide()
                resolve(null)
              },
            },
            Ok: {
              type: 'primary',
              onclick() {
                modal.hide()
                resolve(input.value)
              },
            },
          },
          c
        ),
      })
      modal.show()
    })
  }
  private bindEvent() {
    this.$body.on('click', this.c('.icon-close'), this.hide)
    this.on('optionChange', this.render)
  }
  private render = () => {
    const { options, c, $body } = this
    if (!options.title) {
      $body.addClass(c('no-title'))
    } else {
      $body.rmClass(c('no-title'))
      this.$title.text(options.title)
    }
    if (!options.footer) {
      $body.addClass(c('no-footer'))
    } else {
      $body.rmClass(c('no-footer'))
      this.$footer.html('').append(options.footer)
    }
    if (!options.showClose) {
      this.$close.hide()
    } else {
      this.$close.show()
    }
    this.$body.css('width', options.width + 'px')
    this.$content.html('').append(options.content)
  }
  private initTpl() {
    this.$container.html(
      this.c(stripIndent`
      <div class="body">
        <span class="icon icon-close"></span>
        <div class="title"></div>
        <div class="content"></div>
        <div class="footer"></div>
      </div>
      `)
    )
  }
}

let globalModal: Modal | null = null

function getGlobalModal() {
  if (!globalModal) {
    const container = h('div')
    document.body.append(container)
    globalModal = new Modal(container, {
      showClose: false,
    })
  }

  return globalModal
}

interface IButton {
  type: string
  onclick: types.AnyFn
}

function createButtons(buttons: types.PlainObj<IButton>, c: types.AnyFn) {
  const buttonEls = map(buttons, (button, key) => {
    return h(
      c('.button') + c('.' + button.type),
      {
        onclick: button.onclick,
      },
      key
    )
  })

  return h(c('.button-group'), {}, ...buttonEls)
}

module.exports = Modal
module.exports.default = Modal
