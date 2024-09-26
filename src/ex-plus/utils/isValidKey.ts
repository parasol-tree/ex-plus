/**
 * @description 用于检查对象或者数组的键是否有效，即键不为 null、 undefined 或空字符串
 * @param {Array|string|symbol} key 对象或者数组的键
 * @returns {boolean} 返回布尔值表示键是否有效
 */
export function isValidKey(key: any): boolean {
  return !['', null, 'null', undefined, 'undefined'].includes(key)
}
