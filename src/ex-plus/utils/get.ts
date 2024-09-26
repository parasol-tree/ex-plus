import { isValidKey } from './isValidKey'
import { getArrayIndex } from './getArrayIndex'

type kesType<M> = string | number | symbol | M | [M] | M[] | Array<string | number | symbol>
/**
 * @description 根据对象或者数组的某一个键查询该键对应的值
 * @param {Object|Array} data 要查询的对象或者数组
 * @param {string|number|symbol} path 查询的路径
 * @param {*} defaultValue 查询不到时的默认值
 * @returns 返回查询到的值
 * @example
 * const obj = {
 *   age: 17,
 *   name: 'zhangsan',
 *   k1: {
 *     k2: {
 *       k3: {
 *         address: 'address',
 *       },
 *     },
 *   },
 *   a: [{ b: { c: 3 } }],
 * }
 * const a = get(obj, 'age') // 17
 * const b = get(obj, 'name') // zhangsan
 * const c = get(obj, 'address') // undefined
 * const d = get(obj, 'address', 'earth') // earth
 * const e = get(obj, 'k1.k2.k3') // { address: 'address' }
 * const f = get(obj, ['a', '0', 'b', 'c']) // 3
 *
 * const array = ['k1', ['k2-1', 'k2-2', 'k2-', ['k3-1', 'k3-2', 'k3-3']]]
 *
 * const g = get(array, 0) // k1
 * const h = get(array, 10) // undefined
 * const i = get(array, 10, 'ssss') // ssss
 * const j = get(array, '1.2') // k2-3
 * const k = get(array, '1.3.1') // k3-2
 */
export function get<T, K extends keyof T>(data: T, path: kesType<K>, defaultValue?: any): T[K] {
  if (!data || typeof data !== 'object' || !isValidKey(path)) {
    return defaultValue
  }
  const formatPath = Array.isArray(path)
    ? path
    : String(path)
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
  let result = data
  for (const element of formatPath) {
    if (!isValidKey(element) || result == null || typeof result !== 'object' || !element || !(element in result)) {
      return defaultValue
    }
    const key = getArrayIndex(element)
    result = Object(result)[key]
  }
  return result === undefined ? defaultValue : result
}
