<template>
  <ex-form style="margin-top: 20px" ref="refExForm" label-suffix=":" :model="modelObject" :rules="rules">
    <ex-form-item label="username" prop="username">
      <ExInput type="password" v-model="modelObject.username" :maxlength="10"></ExInput>
    </ex-form-item>
    <ex-form-item label="password" prop="password">
      <ExInput type="textarea" :rows="2" v-model="modelObject.password" :maxlength="200"></ExInput>
    </ex-form-item>
  </ex-form>
  <button @click="submitFunc">submitFunc</button>
  <button @click="resetFunc">resetFunc</button>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormRules, FormInstance } from 'ex-plus/packages/components/form/src/type'

const refExForm = ref<FormInstance>()
const modelObject = reactive<{
  username: string
  password: string
  email: string
}>({
  username: '',
  password: '',
  email: '',
})
const rules = reactive<FormRules>({
  username: [
    { required: true, message: 'Please input Activity username', trigger: 'blur' },
    { min: 3, max: 5, message: 'username Length should be 3 to 5', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please input Activity password' },
    { min: 3, max: 5, message: 'password Length should be 3 to 5' },
  ],
})
const submitFunc = async () => {
  console.log('%c [ submitFunc ]-26', 'font-size:14px; background:#2f79ce; color:#fff;')
  refExForm.value?.validate((vaild, err) => {
    console.log('%c [ vaild ]-30', 'font-size:14px; background:#2f79ce; color:#fff;', vaild, err)
  })
  // refExForm.value?.resetFields()
  // const res = await refExForm.value?.validate()
  // console.log('%c [ res ]-45', 'font-size:14px; background:#2f79ce; color:#fff;', res)
  // const res = await refExForm.value?.validateField(['username', 'password'])
  // console.log('%c [ res ]-43', 'font-size:14px; background:#2f79ce; color:#fff;', res)
  // refExForm.value?.validateField(['password'], (ssss, bbbbb) => {
  //   console.log('%c [ ssss ]-45', 'font-size:14px; background:#2f79ce; color:#fff;', ssss, bbbbb)
  // })
}
const resetFunc = async () => {
  refExForm.value?.resetFields()
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html,
body {
  width: 100%;
  height: 100%;
}
</style>
