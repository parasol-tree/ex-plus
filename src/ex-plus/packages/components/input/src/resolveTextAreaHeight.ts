const CONTEXT_STYLE = [
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-family',
  'font-weight',
  'font-size',
  'line-height',
  'text-rendering',
  'text-transform',
  'text-indent',
  'width',
  'border-width',
  'box-sizing',
]
const HIDDEN_STYLE = `
  visibility:hidden !important;
  position:absolute !important;
  z-index:-1000 !important;
  top:-100px !important;
  left:-1000px !important
`
type TBoxSizing = 'border-box' | 'content-box'
/**
 * @description 返回css属性 [box-sizing, padding-top+padding-bottom, border-top-width + border-bottom-width, 行内样式 CONTEXT_STYLE]
 * @param dom dom 节点
 * @returns
 */
const resolveStyle = (
  dom: HTMLElement,
): {
  boxSizing: TBoxSizing
  paddingTopBottom: number
  borderTopBottom: number
  inlineStyle: string
} => {
  const targetStyle = getComputedStyle(dom)
  const boxSizing = targetStyle.getPropertyValue('box-sizing') as TBoxSizing

  const paddingTop = parseFloat(targetStyle.getPropertyValue('padding-top'))
  const paddingBottom = parseFloat(targetStyle.getPropertyValue('padding-bottom'))

  const borderTop = parseFloat(targetStyle.getPropertyValue('border-top-width'))
  const borderBottom = parseFloat(targetStyle.getPropertyValue('border-bottom-width'))

  const paddingTopBottom = paddingTop + paddingBottom
  const borderTopBottom = borderTop + borderBottom
  const inlineStyle = CONTEXT_STYLE.map((name) => `${name}:${targetStyle.getPropertyValue(name)}`).join(';')
  return {
    boxSizing,
    paddingTopBottom,
    borderTopBottom,
    inlineStyle,
  }
}
/**
 * @description 获取 textarea 的高度
 * @param dom textarea 节点
 * @returns {object} { newHeight, oldHeight}
 */
export default function resolveTextAreaHeight(dom: HTMLTextAreaElement | undefined): {
  newHeight: number
  oldHeight: number
  minHeight: number
} {
  if (!dom) {
    return { newHeight: 0, oldHeight: 0, minHeight: 0 }
  }

  const { boxSizing, paddingTopBottom, borderTopBottom, inlineStyle } = resolveStyle(dom)
  const hiddenDom = document.createElement('textarea')
  document.body.appendChild(hiddenDom)
  hiddenDom.setAttribute('style', `${inlineStyle};${HIDDEN_STYLE}`)
  hiddenDom.value = dom.value
  hiddenDom.style.height = '0px'
  const newScrollHeight = hiddenDom.scrollHeight
  const oldScrollHeight = dom.scrollHeight
  const newHeight = boxSizing === 'border-box' ? newScrollHeight + borderTopBottom : newScrollHeight - paddingTopBottom
  const oldHeight = boxSizing === 'border-box' ? oldScrollHeight + borderTopBottom : oldScrollHeight - paddingTopBottom
  hiddenDom.value = ''
  const singeHeight = hiddenDom.scrollHeight
  const minHeight = boxSizing === 'border-box' ? singeHeight + borderTopBottom : singeHeight - paddingTopBottom
  document.body.removeChild(hiddenDom)
  return {
    newHeight,
    oldHeight,
    minHeight,
  }
}
