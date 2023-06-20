<template>
  <div class="formInfo">
    <el-form ref="target" :model="form" :rules="rules" label-position="left" label-width="153px"
      :hide-required-asterisk="true">
      <el-form-item label="现Beneficiary地址">
        <span>{{ contract_addr }}</span>
      </el-form-item>
      <el-form-item label="新Beneficiary地址" prop="new_addr">
        <el-input style="width: 400px" v-model="form.new_addr" placeholder="请输入Beneficiary地址"></el-input>
      </el-form-item>
      <el-form-item label="生效日期" prop="new_expiration">
        <el-date-picker v-model="form.new_expiration" type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请输入授权截止期限" style="width: 400px"></el-date-picker>
      </el-form-item>
      <el-form-item label="提币上限" prop="new_quota">
        <el-input style="width: 400px" v-model="form.new_quota" placeholder="请输入提币额度上限"><template #suffix>
            <span>FIL</span>
          </template></el-input>
      </el-form-item>
    </el-form>
  </div>
  <div class="submitForm">
    <el-button class="submit" @click="submit">提交</el-button><el-button @click="back">返回</el-button>
  </div>
  <signature :dialogName="'変更Beneficiary地址'" :parentForm="form" v-model:show="visible"></signature>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import signature from "@/components/signature.vue"
import { useStore } from "vuex";
const store = useStore();
const target = ref(null)
const visible = ref(false)
const rules = reactive({
  new_addr: [
    { required: true, message: '请输入Beneficiary地址', trigger: 'blur' },
  ],
  new_quota: [
    { required: true, message: '请输入提币额度上限', trigger: 'blur' },
  ],
  new_expiration: [
    { required: true, message: '请输入授权截止期限', trigger: 'blur' },
  ],
})
const disabledDateFun = (time) => {
  return time.getTime() < Date.now() - 1 * 24 * 3600 * 1000 + 20 * 60 * 1000
}
const form = reactive({
  "new_addr": "",
  "new_quota": "",
  "new_expiration": ""
});
const submit = async () => {
  const valid = await target.value.validate()
  if (valid) {
    visible.value=true
  }
};
const contract_addr=ref('')
const props = defineProps({
  show: {
    type: Boolean,
    default: null,
  },
});
const emit = defineEmits(["update:show"]);
const back = () => {
  store.commit('set_activename', '发起提案')
  emit("update:show", false);
};
onMounted(() => { 
  contract_addr.value=store.state.headInfo.contract_addr
});
</script>
<style lang="less" scoped>
.formInfo {
  border-bottom: 1px solid #d3d6d8;
  padding: 40px 0;

  img {
    width: 20px;
    margin: 0 10px;
  }

  .title {
    margin-bottom: 50px;
    font-weight: 500;
  }
}

.submitForm {
  margin: 30px 0 0 153px;

  .el-button {
    width: 80px;
    font-size: 16px;
    margin-right: 20px;
    border-color: #0090ff;
    color: #0090ff;
  }

  .submit {
    background: #0090ff;
    color: #fff;
  }
}
</style>
  