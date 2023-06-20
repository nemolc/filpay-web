<template>
  <div class="container" v-loading="loading">
    <!-- <div class="container-header">
      <div>
        节点可用余额（FIL）
        <el-button class="primary" @click="change('提币')">提币</el-button>
        <el-button class="info">转入质押币</el-button>
      </div>
      <div class="num" v-if="dataform.miner_available_balance">{{ (dataform.miner_available_balance/(10**18)).toFixed(4) }}</div>
    </div> -->
    <div class="container-content">
      <div class="formInfo" style="padding-bottom: 0">
        <div class="item">
          <div>节点编号</div>
          <div>{{ dataform.miner_id }}</div>
        </div>
        <div class="item">
          <div>质押总额</div>
          <div v-if="dataform.invested_funds">{{ (dataform.invested_funds/(10**18)).toFixed(4) }} FIL</div>
        </div>
        <div class="item">
          <div>质押起始释放高度</div>
          <div>{{ dataform.invested_release_height }}</div>
        </div>
        <div class="item">
          <div>收益起始释放高度</div>
          <div>{{ dataform.beneficiary_release_height }}</div>
        </div>
        <div class="item">
          <div>收益结束释放高度</div>
          <div>{{ dataform.expiration }}</div>
        </div>
        <div class="item">
          <div>收益期间释放上限</div>
          <div v-if="dataform.quota">{{ (dataform.quota/(10**18)).toFixed(4) }} FIL</div>
        </div>
      </div>
      <div class="formInfo">
        <div class="title">收益人信息</div>
        <div class="item" v-for="(item, i) in dataform.beneficiarys_info" :key="i">
          <div>收益人{{ i + 1 }}</div>
          <div>
            {{ ((item.ratio/10000)*100).toFixed(2) }}%<span>{{ item.addr?item.addr:'未知' }}</span><el-button class="info" @click="change(item.addr,dataform.beneficiarys_info,'修改收益人地址')">修改</el-button>
          </div>
        </div>
      </div>
      <div class="formInfo" style="border:0">
        <div class="title">质押人信息</div>
        <div class="item">
          <div>质押币总数</div>
          <div v-if="dataform.invested_funds">{{ (dataform.invested_funds/(10**18)).toFixed(4) }} FIL</div>
        </div>
        <div class="item" v-for="(item, i) in dataform.investors_info" :key="i">
          <div>质押人{{ i + 1 }}</div>
          <div>
            {{ ((item.ratio/10000)*100).toFixed(2) }}%<span>{{ item.addr?item.addr:'未知' }}</span><el-button class="info" @click="change(item.addr,dataform.investors_info,'修改质押人地址')">修改</el-button>
          </div>
        </div>
      </div>
    </div>
    <signature :dialogName="dialogName" :parentForm="form" v-model:show="visible"></signature>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router';
import { get } from '@/utils/request'
import signature from "@/components/signature.vue"
const Route = useRoute();
// const getAssetsFile = (url) => {
//   return new URL(`@/assets/${url}`, import.meta.url).href
// }
const form=reactive({
  addr:"",
  addArr:[]
})
const visible = ref(false)
const dataform = ref('')
const dialogName = ref("")
const loading = ref(false)

onMounted(() => {
    setTimeout(()=>{
      contractdetails()
    },200)
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
const change = (addr,arr,name) => {
  form.addArr=arr
  form.addr=addr
  dialogName.value = name;
  visible.value = true
}
</script>
<style>
.dialogInfo .el-input__prefix {
  right: 13px !important;
  top: 8px !important;
  left: auto !important;
  color: #000;
  cursor: pointer;
}

.dialogInfo .el-input--prefix .el-input__inner {
  padding-left: 15px;
  padding-right: 30px;
}
</style>
<style lang="less" scoped>
.container-header,
.container-content {
  background: #ffffff;
  box-shadow: 0px 3px 6px 1px rgba(160, 160, 160, 0.16);
  border-radius: 3px;
  padding: 30px 34px;
}

.primary,
.info {
  font-size: 16px;
  border-color: #0090ff;
  color: #0090ff;
}

.primary {
  background: #0090ff;
  color: #fff;
}

.container-header {
  
  .num {
    font-size: 32px;
    margin-top: 5px;
    font-weight: bold;
  }
}

.container-content {
  padding: 0 34px 40px 34px;
  margin-top: 26px;
  .ruleForm {
    color: #000;
  }

  .formInfo {
    border-bottom: 1px solid #d3d6d8;
    padding: 40px 0;

    .item {
      display: flex;
      align-items: center;
      margin-bottom: 40px;

      & div:first-child {
        width: 180px;
        color: #a8a8a8;
      }

      span {
        margin: 0 20px;
      }
    }

    .title {
      margin-bottom: 50px;
      font-weight: 500;
    }
  }
}

.dialogInfo {
  .modify {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    p {
      width: 107px;
      text-align: right;
      color: #000;
      margin-right: 30px;
    }

    ul {
      display: flex;
      align-content: center;

      li {
        list-style: none;
        height: 32px;
        cursor: pointer;
        border: 1px solid #c4c6cd;
        border-radius: 3px;
        line-height: 32px;
        width: 110px;
        text-align: center;
        margin-right: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 18px;
          margin-right: 11px;
        }
      }

      .selectedColor {
        border-color: #0090ff;
      }
    }
  }
}
</style>
