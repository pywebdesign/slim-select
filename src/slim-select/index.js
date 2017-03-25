import config from './config.js'
import {hasClassInTree} from './helper.js'
import Data from './data.js'
import Create from './create.js'

export default class SlimSelect {
  constructor (info = {}) {
    this.select = document.querySelector(info.select)
    this.select.tabIndex = -1
    // this.select.style.display = 'none'

    this.config = config()

    this.data = new Data({
      select: this.select,
      hasSearch: (info.hasSearch !== undefined ? info.hasSearch : true)
    })

    this.slim = new Create({
      config: this.config,
      data: this.data,
      placeholderClick: () => { (this.data.contentOpen ? this.close() : this.open()) },
      searchInputChange: (e) => { this.search(e.target.value) },
      optionClick: (e) => { this.set(e.target.dataset.id, 'id') },
      open: () => { this.open() },
      close: () => { this.close() }
    })
    // Add after original select
    this.select.after(this.slim.container)

    // Add onChange listener to original select
    this.select.addEventListener('change', (e) => {
      this.set(e.target.value, 'value')
    })

    // Add onclick listener to document to closeContent if clicked outside
    document.addEventListener('click', (e) => {
      if (!hasClassInTree(e.target, this.config.id)) { this.close() }
    })

    // Add MutationObserver to select
    new MutationObserver((mutations) => {
      this.data.parseSelectData()
      this.data.setSelectedFromSelect()
      this.slim.options()
      this.set(this.data.selected.id, 'id', false)
    }).observe(this.select, {
      attributes: true,
      childList: true,
      characterData: true
    })
  }

  set (value, type = 'value', close = true) {
    this.data.setSelected(value, type)

    this.slim.selected.placeholder.innerHTML = this.data.selected.innerHTML
    this.select.value = this.data.selected.value
    if (close) { this.close() }
  }

  open () {
    this.data.contentOpen = true
    this.slim.search.input.focus()
    this.slim.selected.container.classList.add('open')
    this.slim.selected.arrowIcon.classList.remove('arrow-up')
    this.slim.selected.arrowIcon.classList.add('arrow-down')
    this.slim.content.classList.add('open')
  }

  close () {
    this.data.contentOpen = false
    this.slim.search.input.blur()
    this.slim.selected.container.classList.remove('open')
    this.slim.selected.arrowIcon.classList.add('arrow-up')
    this.slim.selected.arrowIcon.classList.remove('arrow-down')
    this.slim.content.classList.remove('open')
    this.search('') // clear search
  }

  search (value) {
    this.slim.search.input.value = value
    this.data.search(value)
    this.render()
  }

  render () {
    this.slim.options()
  }
}