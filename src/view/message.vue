<template>
  <div class="container">
    <!-- <img src="@assets/success.png" alt=""> -->
    <img src="@/assets/warning.png" alt="">
    <div v-if="Route.query.type==1">恭喜！您已完成合约配置。您的手续费约为{{sxf}}（手续费为{{convert_fil(Route.query.sxf)}}，gas费为{{convert_fil(Route.query.gas)}})</div>
    <!-- <div>您配置的合约正在加速上链中，请耐心等待!</div> -->
    <div v-if="Route.query.type==2">恭喜！您{{Route.query.name}}的申请已提交。您的手续费约为{{sxf}}（手续费为{{convert_fil(Route.query.sxf)}} ，gas费为{{convert_fil(Route.query.gas)}})</div>
    <div>合约更新状态请查阅 <a v-if="scan_msg_url" :href="scan_msg_url">{{Route.query.msgid}}</a><span v-else>{{Route.query.msgid}}</span> </div>
  </div>
</template>
<script setup>
import { ref,onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from 'vuex';
const router = useRouter();
const sxf = ref(0);
const Route=useRoute()
const store = useStore();
const scan_msg_url=ref('')
const convert_fil=(value)=> {
    var fil = (value / (10 ** 18)).toFixed(4);
    if (fil>0.0001){
        return fil+" FIL"
    }
    var nanoFil=(value / (10 ** 9)).toFixed(4);
    return nanoFil+" nanoFIL"
}
onMounted(() => {
    setTimeout(()=>{
      scan_msg_url.value = store.state.headInfo.scan_msg_url.replace(/{cid}/g,Route.query.msgid)
    },100)
    sxf.value=convert_fil(Number(Route.query.sxf)+Number(Route.query.gas))
    
})
</script>
<style lang="less" scoped>
.container {
  font-size: 16px;
  text-align: center;
  img{
    width: 140px;
    margin: 134px 0 67px 0;
  }
  a,span{
    text-decoration: none;
    color: #0090FF;
    margin-left: 5px;
  }
  div{
    margin-bottom: 20px;
  }
}
</style>

