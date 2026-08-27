import { Component, Host, h, Prop, Watch, Element } from '@stencil/core'
import { BEM } from '../../utils/bem'
import { transformTagSelector } from '../../utils/helpers'

@Component({
  tag: 'bal-data',
  styleUrl: 'bal-data.sass',
})
export class Data {
  @Element() element!: HTMLElement

  /**
   * If `true` a bottom border is added to the data-item.
   */
  @Prop() border = false

  /**
   * If `true` the data list is horizontal instead of vertical.
   */
  @Prop() horizontal = false

  @Watch('border')
  borderHandler() {
    this.updateProps([...this.inputElements], 'border')
  }

  private inputElements = ['bal-data-item']

  private updateProps(selectors: string[], key: string) {
    const value = (this as any)[key]
    if (value !== undefined) {
      this.notifyComponents<any>(selectors, input => (input[key] = value))
    }
  }
  private notifyComponents<T>(selectors: string[], callback: (component: T) => void) {
    // the selector is joined at runtime, so the compiler cannot rewrite the tags for us here
    const components = this.element.querySelectorAll<Element>(selectors.map(transformTagSelector).join(', '))
    components.forEach((c: any) => callback(c))
  }

  componentWillLoad() {
    this.borderHandler()
  }
  render() {
    const block = BEM.block('data')

    return (
      <Host
        class={{
          ...block.class(),
          ...block.modifier('has-border').class(this.border),
          ...block.modifier('is-horizontal').class(this.horizontal),
        }}
      >
        <slot></slot>
      </Host>
    )
  }
}
