<template>
  <div class="container">
    <div class="head">关于FILPAY</div>
    <div class="content">FILPAY是一款基于FVM（Filecoin虚拟机）开发的去中心化的轻量级合约支付应用，适用于多方合资节点的收益分配及质押退还场景。鉴于区块链的不可篡改性及已部署合约的不可逆性，FILPAY直接调用开源合约模板，极大降低合资各方的信任成本，彻底减少繁琐高频的多签操作。</div>
    <div class="content">节点控制人（Owner）无需技术背景即可通过平台模板对受益人（Beneficiary）角色进行设定，快速完成节点参数配置。已配置节点将不再依赖平台而自动执行合约动作。对于需要多签投票而实现局部调参的低频场景，本平台提供简便可视化的投票界面，充分兼顾参资方对安全性和便捷性的双重需求。</div>
  </div>
</template>
<style lang="less" scoped>
.container {
  min-height: calc(100vh - 150px);
  background: #ffffff;
  box-shadow: 0px 3px 6px 1px rgba(160, 160, 160, 0.16);
  border-radius: 3px;
  padding: 46px 63px;
}
.head{
  font-weight: bold;
  font-size: 18px;
}
.content{
  text-indent: 2em;
  margin-top: 20px;
  line-height: 32px;
}
</style>
  
  