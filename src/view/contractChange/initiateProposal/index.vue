<template>
  <div v-show="!isshow">
    <div
      class="card"
      v-for="(item, i) in proposals"
      :class="
        item.stat == -1
          ? 'bgUnderway'
          : item.stat == 1
          ? 'bgSuccess'
          : item.stat == 2
          ? 'bgError'
          : ''
      "
      :key="i"
    >
      <div class="item">
        <img
          src="@/assets/icon1.png"
          v-if="item.proposal_type == 5"
          alt=""
        />
        <img
          src="@/assets/icon2.png"
          v-if="item.proposal_type == 4"
          alt=""
        />
        <img
          src="@/assets/icon3.png"
          v-if="item.proposal_type == 2"
          alt=""
        />
        <img
          src="@/assets/icon4.png"
          v-if="item.proposal_type == 3"
          alt=""
        />
        <img
          src="@/assets/icon5.png"
          v-if="item.proposal_type == 1"
          alt=""
        />
        <div>
          <div class="name">{{ item.name }}</div>
        </div>
      </div>
      <el-button @click="openInfo(item)">发起</el-button>
    </div>
  </div>
  <div class="container" v-show="isshow">
    <proposalType1 v-model:show="isshow" v-if="details.proposal_type==1"></proposalType1>
    <proposalType2 v-model:show="isshow" :details="dataform" v-if="details.proposal_type==2"></proposalType2>
    <proposalType3 v-model:show="isshow" :details="dataform" v-if="details.proposal_type==3"></proposalType3>
    <proposalType4 v-model:show="isshow" :details="dataform" v-if="details.proposal_type==4"></proposalType4>
    <proposalType5 v-model:show="isshow" :details="dataform" v-if="details.proposal_type==5"></proposalType5>
  </div>
</template>
  <script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex';
import { get } from "@/utils/request";
import proposalType1 from "./proposalType1.vue";
import proposalType2 from "./proposalType2.vue";
import proposalType3 from "./proposalType3.vue";
import proposalType4 from "./proposalType4.vue";
import proposalType5 from "./proposalType5.vue";
const router = useRouter();
const store = useStore();
const Route=useRoute()
const isshow = ref(false);
const proposals = ref([{
  name:"変更Beneficiary地址",
  proposal_type:1
},{
  name:"变更产出收益释放高度",
  proposal_type:2
},{
  name:"变更质押退还释放高度",
  proposal_type:3
},{
  name:"变更收益人比例",
  proposal_type:4
},{
  name:"更新质押池总额",
  proposal_type:5
}]);
const details = ref("");
const dataform=ref("")
onMounted(() => {
  contractdetails()
});
const contractdetails = async () => {
  try {
    const res = await get(`${sessionStorage.getItem("network")}/${Route.query.id}/contract_details`);
    dataform.value=res.data
  } catch (error) {
    ElMessage.warning(error.msg);
  }
}
const openInfo = (item) => {
  store.commit('set_activename', item.name)
  details.value=item
  isshow.value = true;
};
</script>
  <style lang="less" scoped>
.card {
  display: flex;
  justify-content: space-between;
  background: #ffffff;
  box-shadow: 0px 3px 6px 1px rgba(160, 160, 160, 0.16);
  margin-top: 26px;
  border-radius: 3px;
  padding: 38px 32px;
  align-items: center;
  .el-button {
    width: 60px;
    font-size: 16px;
    border-color: #0090ff;
    color: #0090ff;
  }
  .item {
    display: flex;
    img {
      width: 22px;
      margin: 2px 10px 0 0;
    }
  }

  .name {
    font-size: 18px;
    font-weight: bold;
  }
  .date {
    margin-top: 15px;
    font-size: 14px;
    color: #a8a8a8;
  }
}

.container {
  background: #ffffff;
  box-shadow: 0px 3px 6px 1px rgba(160, 160, 160, 0.16);
  border-radius: 3px;
  padding: 0 34px 40px 34px;
  min-height: calc(100vh - 150px);
  margin-top: 26px;
}
</style>
  