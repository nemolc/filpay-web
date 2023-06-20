<template>
  <div class="formInfo">
    <el-form ref="target" :model="form" :rules="rules" label-position="left" label-width="153px" :hide-required-asterisk="true">
      <el-form-item label="现质押起始释放高度">
        <el-input
          disabled
          v-model="details.invested_release_height"
          placeholder="请输入区块高度"
          style="width: 180px"
        ></el-input>
        <img src="@/assets/change.png" alt="" />
        <el-date-picker
          v-model="form.date1"
          disabled
          type="datetime"
          placeholder="请输入授权截止期限"
          style="width: 180px"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="新质押起始释放高度" prop="new_invested_release_height">
        <el-input
          v-model="form.new_invested_release_height"
          placeholder="请输入区块高度" @blur="getTime(form.new_invested_release_height, 2)"
          style="width: 180px"
        ></el-input>
        <img src="@/assets/change.png" alt="" />
        <el-date-picker
        v-model="form.date2"
          type="datetime"
          placeholder="请输入授权截止期限"
          style="width: 180px"
          @change="setHeight"
        >
        </el-date-picker>
      </el-form-item>
    </el-form>
  </div>
  <div class="submitForm">
    <el-button class="submit" @click="submit">提交</el-button
    ><el-button @click="back">返回</el-button>
  </div>
  <signature :dialogName="'变更质押退还释放高度'" :parentForm="form" v-model:show="visible"></signature>
</template>
  <script setup>
import { ref, reactive, onMounted } from "vue";
import signature from "@/components/signature.vue"
import { getTimestamp, getHeight } from "@/utils/date"
import { useStore } from 'vuex';
const store = useStore();
const target = ref(null)
const visible = ref(false)
const form = reactive({
  date1:"",
  date2:"",
  "new_invested_release_height": ""
});
const rules = reactive({
  new_invested_release_height: [
    { required: true, message: '请输入区块高度', trigger: 'blur' },
  ],
})
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
onMounted(() => { 
  getTime(props.details.invested_release_height,1)
});
const getTime = (height, type) => {
  if(height=="") return
  const { start_at, block_delay_secs } = store.state.headInfo
  const d = getTimestamp(start_at, block_delay_secs, height)
  if (type == 1) {
    console.log(d)
    form.date1 = d
  } else {
    form.date2 = d
  }
};
const setHeight = () => {
  const { start_at, block_delay_secs } = store.state.headInfo
  let date = new Date(form.date2);
  const { height,revision_time } = getHeight(start_at, block_delay_secs, date.getTime() / 1000)
  form.new_invested_release_height=height
  form.date2 = revision_time
}
const submit = async () => {
  const valid = await target.value.validate()
  if (valid) {
    visible.value=true
  }
};

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
  