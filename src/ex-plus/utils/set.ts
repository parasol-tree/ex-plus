import { isValidValue } from './isValidValue'

interface AnyObject {
  [key: string | number | symbol]: any | AnyObject | any[]
}
type TPath = string | number | symbol | (string | number)[] | undefined

/**
 * @description 对 对象或者数组的某一个键设置新值
 * @param {Object|Array} data 要设置值的对象或者数组
 * @param {*} path 要设置的属性的路径
 * @param {*} value 要设置的值
 * @returns 设置值 后 的对象或者数组
 * @example
 * object = {}
 * set(object, 'name', 'zhngsan') // { name: 'zhngsan' }
 * set(object, 'lisi.address', 'earth') // { lisi: { address: 'earth' } }
 * set(object, 'lisi[address]', 'earth') // { lisi: { address: 'earth' } }
 * set(object, 'lisi["address"]', 'earth') // { lisi: { address: 'earth' } }
 * set(object, 'a[0].b.c', 4); // { a: [{ b: { c: 4 } }] };
 * set(object, ['x', '0', 'y', 'z'], 5) // { x: [{ y: { z: 5 } }] }
 *
 * const array = [] as any[]
 * set(array, 0, 1) // [1]
 * set(array, 1, 1) // [empty, 1]
 * set(array, '0', [1,2]) // [[1,2]]
 */
export function set(data: AnyObject, path: TPath, value: any): AnyObject {
  if (!isValidValue(path)) {
    return data
  }
  if (typeof path === 'number') {
    path = String(path)
  }
  if (typeof path === 'string') {
    path = path.match(/[^.[\]]+/g)?.map((segment) => {
      return segment.replace(/\\([.[\]])/g, '$1')
    })
  }
  const setRecursively = (data: AnyObject, path: any, value: any, currentDepth: any) => {
    const key = path[currentDepth]
    const nextKey = path[currentDepth + 1]
    const isLastKey = currentDepth === path.length - 1
    if (key === '') {
      return
    }
    // if (nextKey === '' || nextKey === undefined) {
    if (isLastKey || nextKey === '' || nextKey === undefined) {
      data[key] = value
      return
    }
    const isArrayIndex = /^\d+$/.test(nextKey)
    if (isArrayIndex) {
      if (!Array.isArray(data[key])) {
        data[key] = []
      }
    } else {
      if (!data[key] || Array.isArray(data[key])) {
        data[key] = {}
      }
    }
    setRecursively(data[key], path, value, currentDepth + 1)
  }
  setRecursively(data, path, value, 0)
  return data
}
