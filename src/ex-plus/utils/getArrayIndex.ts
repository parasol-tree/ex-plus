/**
 * @description 用于将键转换为数组索引
 * @param key
 * @returns 函数尝试将传入的键转换为整数索引，如果无法转换为整数，则返回原始键。
 */
export function getArrayIndex<T>(key: T): T | number {
  const index = parseInt(key as string, 10)
  return isNaN(index) ? key : index
}
