<template>
    <div class="container">
        111
    </div>
  </template>
  <script setup>
  import { ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  const router = useRouter();
  const input = ref(null);
  
  </script>
  <style lang="less" scoped>
  .container {
    height: calc(100vh - 60px);
  }
  
  .home {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60%;
  }
  
  .title {
    font-size: 36px;
    font-weight: 400;
    color: #000;
    line-height: 58px;
  
    img {
      width: 58px;
    }
  }
  
  .searchInput {
    width: 526px;
    height: 50px;
    margin: 50px 0 30px 0;
    font-size: 16px;
    box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
    border-radius: 5px;
    border: 0;
  
    :deep(.el-input__suffix-inner) {
      color: #A8A8A8 !important;
    }
  }
  
  .register {
    font-size: 16px;
  
    span {
      cursor: pointer;
      color: #0090ff;
      margin-left: 5px;
    }
  }
  </style>
  
  