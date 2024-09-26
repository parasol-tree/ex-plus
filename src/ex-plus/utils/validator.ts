import Schema, { type RuleItem } from 'async-validator'

/**
 * @description 表单验证 文档地址：https://github.com/yiminghe/async-validator
 * @param propName 要验证的字段（必需）
 * @param value 对应字段的值
 * @param rules 验证规则
 * @returns 返回 validator 函数本身（一个 promise）
 */
const doValidate = (propName: string, value: any, rules: RuleItem[]) => {
  const descriptor = { [propName]: rules }
  const validator = new Schema(descriptor)
  const data = { [propName]: value }
  return validator.validate(data, { firstFields: true })
}

export { doValidate }
