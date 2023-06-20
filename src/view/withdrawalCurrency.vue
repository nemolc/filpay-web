<template>
  <div class="container">
    <div class="container-header">
      <div>节点可用余额（FIL）</div>
      <div class="num">{{dataform.miner_available_balance?(dataform.miner_available_balance/(10**18)).toFixed(4):0}}</div>
    </div>
    <div class="formInfo">
      <el-form :hide-required-asterisk="true" ref="target" :model="form" :rules="rules" label-position="left"
        label-width="153px">
        <el-form-item label="提币数量" prop="amount">
          <el-input style="width: 400px" v-model="form.amount" placeholder="请输入提币数量"><template #suffix>
              <span>FIL</span>
            </template></el-input>
        </el-form-item>
      </el-form>
      <div class="add">
        注：所有提币均会充入节点Beneficiary角色地址（配置为合约地址），<br />
        并会根据已设比例自动分发给对应的收益人（或质押人）
      </div>
    </div>
    <div class="submitForm">
      <el-button class="submit" @click="submit">提交</el-button><el-button @click="router.go(-1)">返回</el-button>
    </div>
    <signature :dialogName="'提币'" :parentForm="form" v-model:show="visible"></signature>
  </div>
</template>
<script setup>
import { ref, reactive,onMounted } from "vue";
import { useRouter,useRoute } from "vue-router";
import signature from "@/components/signature.vue"
import { ElMessage } from 'element-plus'
import { get } from '@/utils/request'
const router = useRouter();
const Route=useRoute()
const visible = ref(false)
const target = ref(null)
const rules = reactive({
  amount: [
    { required: true, message: '请输入提币数量', trigger: 'blur' },
  ],
})
const dataform = ref('')
const loading = ref(false)
const form = reactive({
  amount: "",
})
onMounted(() => {
    contractdetails()
})
const contractdetails = async () => {
  loading.value = true
  try {
    const res = await get(`${sessionStorage.getItem("network")}/${Route.query.id}/contract_details`);
    dataform.value=res.data
    loading.value = false
  } catch (error) {
    ElMessage.warning(error.msg);
    loading.value = false
  }
}
const submit = async () => {
  const valid = await target.value.validate()
  if (valid) {
    visible.value=true
  }
};
</script>
<style lang="less" scoped>
.container {
  background: #ffffff;
  box-shadow: 0px 3px 6px 1px rgba(160, 160, 160, 0.16);
  border-radius: 3px;
  padding: 30px 34px 40px 34px;
  min-height: calc(100vh - 150px);

  .container-header {
    .num {
      font-size: 32px;
      margin-top: 5px;
      font-weight: bold;
    }
  }

  .formInfo {
    border-bottom: 1px solid #d3d6d8;
    padding: 30px 0;

    .title {
      margin-bottom: 50px;
      font-weight: 500;
    }
  }

  .add {
    font-size: 14px;
    color: #A8A8A8;
    margin-left: 153px;
    display: flex;
    line-height: 24px;
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
}
</style>