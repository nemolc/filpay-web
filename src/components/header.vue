

<template>
  <div class="header">
    <div class="header-logo" @click="init">
      <img src="@/assets/h-logo.png" alt="" />
    </div>
    <div class="header-seach">
      <el-input v-if="isShow" @keyup.enter="searchValue" v-model="input" placeholder="输入节点号查看或配置" class="searchInput">
        <template #suffix>
          <el-icon style="font-size:26px" @click="searchValue">
            <search />
          </el-icon>
        </template>
      </el-input>
      <el-button v-if="isShow && isRegister" @click="registerImmediately">立即配置智能合约</el-button>
      <div class="network">
        <!-- <el-dropdown @command="handleCommand"> -->
        <span class="el-dropdown-link">
          <img src="@/assets/network.png" alt="" />{{ activeNetwork }}&nbsp;
          <!-- <el-icon>
              <arrow-down />
            </el-icon> -->
        </span>
        <!-- <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="item.name" v-for="(item, i) in dataform" :key="i">{{ item.name
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown> -->
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, inject, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus'
import { get } from '../utils/request'
const store = useStore();
const reload = inject('reload')
const Route = useRoute();
const router = useRouter();
const input = ref('');
const dataform = ref([])
const activeNetwork = ref("");
const isShow = computed(function () {
  return Route.name == "index" ? false : true;
});
const isRegister = computed(function () {
  return Route.name == "register" ? false : true;
});
const init = () => {
  router.push({ path: "/index" });
};
const registerImmediately = () => {
  router.push({ path: "/register" });
};
watch(() => Route.query.id, (newValue) => {
  input.value = newValue
}, { immediate: true });
onMounted(() => {
  systeminfo()
})
const systeminfo = async () => {
  try {
    const res = await get(`system_info`);
    dataform.value = res.data.networks
    if (sessionStorage.getItem('network')) {
      let info = dataform.value.filter(item => item.name == sessionStorage.getItem('network'));
      store.commit('set_headInfo', info[0])
      activeNetwork.value = sessionStorage.getItem('network')
    } else {
      activeNetwork.value = dataform.value[0].name
      store.commit('set_headInfo', dataform.value[0])
      sessionStorage.setItem("network", activeNetwork.value);
    }
  } catch (error) {
    ElMessage.warning(error.msg);
  }
  // input.value=Route.query.id
}
const searchValue = () => {
  if (input.value.trim() == "") return
  contractdetails()
};
const contractdetails = async () => {
  try {
    await get(`${sessionStorage.getItem("network")}/${input.value}/contract_details`);
    router.push({ path: "/contractDetail", query: { id: input.value } });
    Route.name == "contractDetail" && reload()
  } catch (error) {
    if (error.code == 404) {
      router.push({ path: "/register", query: { show: 'ture' } });
      Route.name == "register" && reload()
    } else {
      ElMessage.warning(error.msg);
    }
  }
}
const handleCommand = (command) => {
  activeNetwork.value = command;
  sessionStorage.setItem("network", command);
  reload()
};
</script>
<style scoped lang="less">
.header {
  background: #0090ff;
  width: 100%;
  height: 60px;
  font-size: 16px;
  color: #fff;
  line-height: 60px;
  display: flex;
  padding: 0 30px;
  justify-content: space-between;

  .header-logo {
    font-weight: 400;
    cursor: pointer;

    img {
      height: 30px;
    }
  }

  .header-seach {
    display: flex;
    align-items: center;
    flex-flow: 1;

    .searchInput {
      width: 526px;
      font-size: 16px;
      height: 40px;
      outline: none;

      :deep(.el-input__suffix-inner) {
        color: #fff !important;
      }

      :deep(.el-input__wrapper) {
        border: 1px solid #fff;
        box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
        background: transparent;
      }

      :deep(.el-input__inner::placeholder),
      :deep(.el-input__inner) {
        color: #fff
      }
    }

    :deep(.el-input) {
      box-shadow: 0;
    }

    .el-button {
      margin-left: 20px;
      height: 40px;
      background: transparent;
      color: #fff;
    }

    .network {
      margin-left: 30px;
      // margin-top: 39px;

      .el-dropdown-link {
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;

        img {
          width: 23px;
          margin-right: 10px;
        }
      }

      .el-icon-arrow-down {
        margin-left: 7px;
      }
    }
  }
}
</style>
