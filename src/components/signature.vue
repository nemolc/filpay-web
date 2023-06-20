<template>
    <el-dialog :title="dialogName" v-model="dialogVisible" width="600px" @close="colse">
        <div class="dialogInfo" v-loading="loading">
            <div>
                <div class="modify">
                    <p>{{props.dialogName=='修改质押人地址'?'质押人地址':props.dialogName == "修改收益人地址"?'收益人地址':'钱包地址'}}</p>
                    <el-input v-model="addr" placeholder="请输入钱包地址" onkeyup="value=value.replace(/\s+/g, '')"
                        style="width: 400px">
                    </el-input>
                </div>
                <div class="modify">
                    <p>签名</p>
                    <ul>
                        <li v-for="(item, index) in currency" :key="index" @click="chooseCurrency(index)"
                            :class="{ selectedColor: currencyActive == index }">
                            <img :src="item.icon" alt="" />{{ item.name }}
                        </li>
                    </ul>
                </div>
                <div class="modify">
                    <el-input v-model="password" placeholder="请输入私钥" v-if="currencyActive == 0"
                        style="width: 400px; margin-left: 137px"></el-input>
                    <el-input v-model="passwordStr"
                        placeholder="请输入您的助记词，每个单词之间以空格分隔。如：tissue hunt hip theme pond abandon flavor hand decline miss fog junior"
                        type="textarea" v-else rows="5" style="width: 400px; margin-left: 137px"></el-input>

                </div>
                <div class="tips" v-if="currencyActive != 0"><img src="../assets/w.png" />您也可以一次粘贴助记词</div>
            </div>
            <div class="modify" style="margin-top: 30px">
                <el-button class="primary" @click="submit" style="margin-left: 137px">提交</el-button>
            </div>
        </div>
    </el-dialog>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router';
import { post } from '../utils/request'
import { Sigs, isEqualAddress } from '../utils/sigs'
import { getTimestamp, getHeight } from "../utils/date"
import { _decodeBase64, uint8arrayToBase64 } from "../utils/base64"
const getAssetsFile = (url) => {
    return new URL(`../assets/${url}`, import.meta.url).href
}
const Route = useRoute();
const router = useRouter()
const store = useStore();
const addr = ref('')
// f1ll5sbovf56rg3ba3keshbis7zahn3yurc3uj45y
const addrs = ref([])
const num = ref(0)
const pushData = ref(0)
const buildData = ref([])
const password = ref('')
// 7b2254797065223a22736563703235366b31222c22507269766174654b6579223a22544e457251396b384f6a676a69796e726738702b6e416b77585a7a4f364669785244496e6d676142324a343d227d
const passwordStr = ref('')
// tissue hunt hip theme pond abandon flavor hand decline miss fog junior
const dialogVisible = ref(false)
const currencyActive = ref(0)
const loading = ref(false)
const props = defineProps({
    dialogName: {
        type: String,
        default: null,
    },
    show: {
        type: Boolean,
        default: null,
    },
    parentForm: {
        type: String,
        default: null,
    },
})
const { start_at, addr_type, block_delay_secs } = store.state.headInfo
const emit = defineEmits(["update:show"]);
watch(() => props.show, (newValue) => {
    dialogVisible.value = newValue
}, { immediate: true });
const currency = reactive([{
    name: "私钥签名",
    icon: getAssetsFile("signature.png"),
},
{
    name: "助记词",
    icon: getAssetsFile("zjc.png"),
}])
const colse = () => {
    num.value = 0
    loading.value = false
    dialogVisible.value = false
    emit('update:show', false)
}
const submit = () => {
    if (currencyActive.value == 0) {
        if (addr.value.trim()=="" || password.value.trim() == "") {
            ElMessage.warning("钱包地址和私钥签名不能为空")
            return
        }
        addrs.value = Sigs.getAddressesByPrivateKey(addr_type, password.value) //私钥
    } else {
        if (addr.value.trim()=="" || passwordStr.value.trim() == "") {
            ElMessage.warning("钱包地址和助记词不能为空")
            return
        }
        addrs.value = Sigs.getAddressByKeywords(addr_type, passwordStr.value) //助记词
    }
    let newAdd = props.dialogName == "修改质押人地址" || props.dialogName == "修改收益人地址" ? props.parentForm.addr : addr.value
    if (isEqualAddress(newAdd, addrs.value) == -1) {
        ElMessage.warning(currencyActive.value == 0 ? "您输入的钱包地址和私钥不匹配" : "您输入的钱包地址和助记词不匹配")
        return
    }
    let date = new Date(props.parentForm.new_expiration);
    const { height } = getHeight(start_at, block_delay_secs, date.getTime() / 1000)
    loading.value = true
    pushData.value = 0
    if (props.dialogName == "合约配置") {
        num.value = 0
        buildMessage({
            from: addr.value,
            miner_id: props.parentForm.miner_id,
            msg_type: "updateBeneficiary",
            params: {
                new_expiration: height, //生效期限 
                new_quota: props.parentForm.new_quota, //提币上限
            }
        })
    } else if (props.dialogName == "変更Beneficiary地址") {
        buildMessage({
            from: addr.value,
            miner_id: Route.query.id,
            msg_type: "propose",
            params: {
                proposal_type: 1,
                proposal_details: {
                    new_addr: props.parentForm.new_addr,
                    new_quota: props.parentForm.new_quota,
                    new_expiration: height,
                }
            }
        })
    } else if (props.dialogName == "变更产出收益释放高度") {
        buildMessage({
            from: addr.value,
            miner_id: Route.query.id,
            msg_type: "propose",
            params: {
                proposal_type: 2,
                proposal_details: {
                    new_beneficiary_release_height: Number(props.parentForm.new_beneficiary_release_height)
                }
            }
        })
    } else if (props.dialogName == "变更质押退还释放高度") {
        buildMessage({
            from: addr.value,
            miner_id: Route.query.id,
            msg_type: "propose",
            params: {
                proposal_type: 3,
                proposal_details: {
                    new_invested_release_height: Number(props.parentForm.new_invested_release_height)
                }
            }
        })
    } else if (props.dialogName == "变更收益人比例") {
        let arr = JSON.parse(JSON.stringify(props.parentForm.new_allot_ratios))
        arr.forEach(item => item.ratio = (parseInt(parseInt(item.ratio) / 100 * 10000)))
        buildMessage({
            from: addr.value,
            miner_id: Route.query.id,
            msg_type: "propose",
            params: {
                proposal_type: 4,
                proposal_details: {
                    new_allot_ratios: arr
                }
            }
        })
    } else if (props.dialogName == "更新质押池总额") {
        buildMessage({
            from: addr.value,
            miner_id: Route.query.id,
            msg_type: "propose",
            params: {
                proposal_type: 5,
                proposal_details: {
                    new_invested_funds: props.parentForm.new_invested_funds
                }
            }
        })
    } else if (props.dialogName == "投票") {
        buildMessage({
            from: addr.value,
            miner_id: Route.query.id,
            msg_type: "vote",
            params: {
                proposal_id: 1,
                approved: props.parentForm.approved
            }
        })
    } else if (props.dialogName == "提币") {
        buildMessage({
            from: addr.value,
            miner_id: Route.query.id,
            msg_type: "withdraw",
            params: {
                amount: props.parentForm.amount
            }
        })
    } else if (props.dialogName == "修改质押人地址") {
        loading.value = false
        const isAdd=props.parentForm.addArr.filter((info) => {
            return addr.value == info.addr;
        });
        if (isAdd.length>0) {
            ElMessage.warning("质押人信息列表钱包地址有重复，请重新输入")
            return
        }
        loading.value = true
        buildMessage({
            from: props.parentForm.addr,
            miner_id: Route.query.id,
            msg_type: "changeInvestor",
            params: {
                new_addr: addr.value,
            }
        })
    } else if (props.dialogName == "修改收益人地址") {
        loading.value = false
        const isAdd=props.parentForm.addArr.filter((info) => {
            return addr.value == info.addr;
        });
        if (isAdd.length>0) {
            ElMessage.warning("收益人信息列表钱包地址有重复，请重新输入")
            return
        }
        loading.value = true
        buildMessage({
            from: props.parentForm.addr,
            miner_id: Route.query.id,
            msg_type: "changeBeneficiary",
            params: {
                new_addr: addr.value,
            }
        })
    }
}
onMounted(() => {

})

const pushMessage = async (info) => {
    try {
        const res = await post(sessionStorage.getItem("network") + "/push_message",
            info
        );
        num.value += 1
        if (num.value == 2) {
            colse()
            router.push({
                path: "/prompt", query: {
                    type: 1,
                    msgid: res.data.msg_cid,
                    gas: pushData.value,
                    sxf: buildData.value[0].value,
                    id: props.parentForm.miner_id,
                    name: props.dialogName
                }
            });
        } else {
            let arr1 = JSON.parse(JSON.stringify(props.parentForm.beneficiarys_allot_ratios))
            let arr2 = JSON.parse(JSON.stringify(props.parentForm.investors_allot_ratios))
            arr1.forEach(item => item.ratio = (parseInt(parseInt(item.ratio) / 100 * 10000)))
            arr2.forEach(item => item.ratio = (parseInt(parseInt(item.ratio) / 100 * 10000)))
            buildMessage({
                from: addr.value,
                miner_id: props.parentForm.miner_id,
                msg_type: "registerBeneficiary",
                params: {
                    invested_funds: props.parentForm.invested_funds,
                    beneficiary_release_height: Number(props.parentForm.beneficiary_release_height),
                    invested_release_height: Number(props.parentForm.invested_release_height),
                    beneficiarys_allot_ratios: arr1,
                    investors_allot_ratios: arr2,
                }
            })
        }
    } catch (error) {
        loading.value = false
        ElMessage.error(error.msg)
    }
};
const qtpushMessage = async (info) => {
    try {
        const res = await post(sessionStorage.getItem("network") + "/push_message",
            info
        );
        colse()
        router.push({
            path: "/prompt", query: {
                type: 2,
                msgid: res.data.msg_cid,
                gas: pushData.value,
                sxf: buildData.value[0].value,
                id: Route.query.id,
                name: props.dialogName
            }
        });
    } catch (error) {
        loading.value = false
        ElMessage.error(error.msg)
    }
};
const buildMessage = async (info) => {
    try {
        const res = await post(sessionStorage.getItem("network") + "/build_message",
            {
                ...info
            }
        );
        buildData.value = res.data
        let newAdd = props.dialogName == "修改质押人地址" || props.dialogName == "修改收益人地址" ? props.parentForm.addr : addr.value
        if (currencyActive.value == 0) {
            res.data.forEach(item => {
                pushData.value += Number(item.estimated_cost)
                item.msg_cid = new Uint8Array(_decodeBase64(item.msg_cid));
                item.signature = uint8arrayToBase64(Sigs.SignByPrivateKey(addr_type, password.value, isEqualAddress(newAdd, addrs.value) == 0 ? 'secp256k1' : 'delegated', item.msg_cid)) //私钥签名
            });
        } else {
            res.data.forEach(item => {
                pushData.value += Number(item.estimated_cost)
                item.msg_cid = new Uint8Array(_decodeBase64(item.msg_cid));
                item.signature = uint8arrayToBase64(Sigs.SignByKeywords(addr_type, passwordStr.value, isEqualAddress(newAdd, addrs.value) == 0 ? 'secp256k1' : 'delegated', item.msg_cid)) //助记词签名
            });
        }
        console.log(pushData.value)
        if (props.dialogName == "合约配置") {
            pushMessage(res.data)
        } else {
            qtpushMessage(res.data)
        }
    } catch (error) {
        loading.value = false
        ElMessage.error(error.msg)
    }
};
const chooseCurrency = (i) => {
    currencyActive.value = i;
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
.primary,
.info {
    font-size: 16px;
    border-color: #0090ff;
    color: #0090ff;
}

.tips {
    width: 400px;
    height: 40px;
    background: #DBEFFF;
    border-radius: 3px;
    opacity: 1;
    border: 1px solid #0090FF;
    display: flex;
    align-items: center;
    color: #000;
    font-size: 14px;
    padding: 0 13px;
    margin-left: 137px;

    img {
        width: 20px;
        margin-right: 10px;
    }
}

.primary {
    background: #0090ff;
    color: #fff;
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