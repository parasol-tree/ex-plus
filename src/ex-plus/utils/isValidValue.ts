/**
 * @description 用于检查一个参数是否为有效的值
 * @param {*} data 要检查的参数
 * @returns {boolean} 返回布尔值表示该参数是否是有效的值
 */
export function isValidValue<T>(data: T): boolean {
  if (data === '' || data === null || data === 'null' || data === undefined || data === 'undefined') {
    return false as const
  }
  if (Object.prototype.toString.call(data) === '[object Object]') {
    return Object.keys(data as object).length > 0
  }
  if (Array.isArray(data)) {
    return (data as Array<any>).length > 0
  }
  if (typeof data === 'number') {
    return true
  }
  return Boolean(data)
}
