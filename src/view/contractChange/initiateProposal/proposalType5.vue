<template>
  <div class="formInfo">
    <el-form ref="target" :model="form" :rules="rules" label-position="left" label-width="153px"
      :hide-required-asterisk="true">
      <el-form-item label="当前质押池">
        <span>{{ convert_fil(details.invested_funds) }}</span>
      </el-form-item>
      <el-form-item label="更新质押池" prop="new_invested_funds">
        <el-input style="width: 400px" v-model="form.new_invested_funds" placeholder="请输入更新质押总额"><template #suffix>
            <span>FIL</span>
          </template></el-input>
      </el-form-item>
    </el-form>
  </div>
  <div class="submitForm">
    <el-button class="submit" @click="submit">提交</el-button><el-button @click="back">返回</el-button>
  </div>
  <signature :dialogName="'更新质押池总额'" :parentForm="form" v-model:show="visible"></signature>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import signature from "@/components/signature.vue"
import { useStore } from "vuex";
const store = useStore();
const target = ref(null)
const visible = ref(false)
const rules = reactive({
  new_invested_funds: [
    { required: true, message: '请输入更新质押总额', trigger: 'blur' },
  ],
})
const form = reactive({
  "new_invested_funds": "",
});
const submit = async () => {
  const valid = await target.value.validate()
  if (valid) {
    visible.value = true
  }
};
const convert_fil=(value)=> {
    var fil = (value / (10 ** 18)).toFixed(4);
    if (fil>0.0001){
        return fil+" FIL"
    }
    var nanoFil=(value / (10 ** 9)).toFixed(4);
    return nanoFil+" nanoFIL"
}
const props = defineProps({
  details: {
    type: String,
    default: null,
  },
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
onMounted(() => { });
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
  