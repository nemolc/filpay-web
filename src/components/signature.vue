<template>
	<el-dialog :title="dialogName" v-model="dialogVisible" width="600px" @close="colse">
		<div class="dialogInfo" v-loading="loading">
			<div class="marb_10">
				<div class="modify">
					<p>{{ props.dialogName == "修改质押人地址" ? "现质押人地址" : props.dialogName == "修改收益人地址" ? "现收益人地址" : "钱包地址" }}</p>
					<el-input v-model.trim="addr" placeholder="请输入钱包地址" onkeyup="value=value.replace(/\s+/g, '')" style="width: 400px"></el-input>
				</div>
				<div class="modify">
					<p>签名</p>
					<ul>
						<li v-for="(item, index) in currency" :key="index" @click="chooseCurrency(index)" :class="{ selectedColor: currencyActive == index }"><img :src="item.icon" alt="" />{{ item.name }}</li>
					</ul>
				</div>
				<div class="modify">
					<el-input v-model.trim="password" v-if="password_visible == true" placeholder="请输入私钥" style="width: 400px; margin-left: 137px"></el-input>
					<el-input v-model.trim="password2" @blur="sumsSy" placeholder="请输入私钥" v-if="currencyActive == 0" style="width: 400px; margin-left: 137px"></el-input>
					<el-input
						v-model="passwordStr"
						placeholder="请输入您的助记词，每个单词之间以空格分隔。如：tissue hunt hip theme pond abandon flavor hand decline miss fog junior"
						type="textarea"
						v-else
						rows="5"
						style="width: 400px; margin-left: 137px"
					></el-input>
				</div>
				<div class="tips" v-if="currencyActive != 0"><img src="../assets/w.png" />您也可以一次粘贴助记词</div>
			</div>
			<div class="line modify" v-if="props.dialogName == '修改质押人地址' || props.dialogName == '修改收益人地址'">
				<p class="mar_30">{{ props.dialogName == "修改质押人地址" ? "新质押人地址" : props.dialogName == "修改收益人地址" ? "新收益人地址" : "钱包地址" }}</p>
				<el-input class="mar_30" v-model="new_addr" placeholder="请输入钱包地址" onkeyup="value=value.replace(/\s+/g, '')" style="width: 400px"></el-input>
			</div>
			<div class="modify" style="margin-top: 30px">
				<el-button class="primary" @click="submit" style="margin-left: 137px">提交</el-button>
			</div>
		</div>
	</el-dialog>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { post } from "../utils/request";
import { Sigs, isEqualAddress } from "../utils/sigs";
import { FilStrToAttoStr, ratioToInt } from "../utils/tool";
import { _decodeBase64, uint8arrayToBase64 } from "../utils/base64";

const getAssetsFile = (url) => {
	return new URL(`../assets/${url}`, import.meta.url).href;
};
const Route = useRoute();
const router = useRouter();
const store = useStore();
const addr = ref("");
const isaddr = ref("");
const isupaddr = ref("");
const isregaddr = ref("");
const new_addr = ref("");
// f1ll5sbovf56rg3ba3keshbis7zahn3yurc3uj45y
const addrs = ref([]);
const num = ref(0);
const numTimes = ref(0);
const pushData = ref(0);
const buildData = ref([]);
var password = ref("");
var password_visible = ref(false);

var password2 = ref("");
// 7b2254797065223a22736563703235366b31222c22507269766174654b6579223a22544e457251396b384f6a676a69796e726738702b6e416b77585a7a4f364669785244496e6d676142324a343d227d
const passwordStr = ref("");
// tissue hunt hip theme pond abandon flavor hand decline miss fog junior
const dialogVisible = ref(false);

const currencyActive = ref(0);
const loading = ref(false);
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
});
const { start_at, addr_type, block_delay_secs } = store.state.headInfo;
const emit = defineEmits(["update:show"]);
watch(
	() => props.show,
	(newValue) => {
		dialogVisible.value = newValue;
	},
	{ immediate: true }
);
const currency = reactive([
	{
		name: "私钥签名",
		icon: getAssetsFile("signature.png"),
	},
	{
		name: "助记词",
		icon: getAssetsFile("zjc.png"),
	},
]);
const colse = () => {
	num.value = 0;
	numTimes.value = 0;
	loading.value = false;
	dialogVisible.value = false;
	emit("update:show", false);
};
const submit = async () => {
	if (currencyActive.value == 0) {
		console.log(addr.value, password._rawValue);
		if (!addr.value || !password) {
			ElMessage.warning("钱包地址和私钥签名不能为空");
			return;
		}
		addrs.value = await Sigs.getAddressesByPrivateKey(addr_type, password._rawValue); //私钥
	} else {
		if (!addr.value || !passwordStr.value) {
			ElMessage.warning("钱包地址和助记词不能为空");
			return;
		}
		// 将字符串转换为数组
		addrs.value = await Sigs.getAddressByKeywords(addr_type, passwordStr.value.split(" ")); //助记词
	}
	let newAdd = props.dialogName == "修改质押人地址" || props.dialogName == "修改收益人地址" ? props.parentForm.addr : addr.value;

	let isEqual = false;
	for (var i in addrs.value) {
		if (isEqualAddress(newAdd, addrs.value[i]) === true) {
			isEqual = true;
		}
	}
	if (!isEqual) {
		ElMessage.warning("您输入的钱包地址和私钥不匹配");
		return;
	}

	loading.value = true;
	pushData.value = 0;
	if (props.dialogName == "合约配置") {
		num.value = 0;
		buildMessage({
			from: addr.value.trim(),
			miner_id: props.parentForm.miner_id,
			msg_type: "updateBeneficiary",
			params: {
				new_expiration: Number(props.parentForm.new_expiration), //生效期限
				new_quota: FilStrToAttoStr(props.parentForm.new_quota), //提币上限
			},
		});
	} else if (props.dialogName == "変更Beneficiary地址") {
		buildMessage({
			from: addr.value.trim(),
			miner_id: Route.query.id,
			msg_type: "propose",
			params: {
				proposal_type: 1,
				proposal_details: {
					new_addr: props.parentForm.new_addr.trim(),
					new_quota: FilStrToAttoStr(props.parentForm.new_quota),
					new_expiration: Number(props.parentForm.new_expiration),
				},
			},
		});
	} else if (props.dialogName == "变更产出收益释放高度") {
		buildMessage({
			from: addr.value.trim(),
			miner_id: Route.query.id,
			msg_type: "propose",
			params: {
				proposal_type: 2,
				proposal_details: {
					new_beneficiary_release_height: Number(props.parentForm.new_beneficiary_release_height),
				},
			},
		});
	} else if (props.dialogName == "变更质押退还释放高度") {
		buildMessage({
			from: addr.value.trim(),
			miner_id: Route.query.id,
			msg_type: "propose",
			params: {
				proposal_type: 3,
				proposal_details: {
					new_invested_release_height: Number(props.parentForm.new_invested_release_height),
				},
			},
		});
	} else if (props.dialogName == "变更收益人比例") {
		let arr = JSON.parse(JSON.stringify(props.parentForm.new_allot_ratios));
		arr.forEach((item) => (item.ratio = parseInt(ratioToInt(item.ratio))));
		buildMessage({
			from: addr.value.trim(),
			miner_id: Route.query.id,
			msg_type: "propose",
			params: {
				proposal_type: 4,
				proposal_details: {
					new_allot_ratios: arr,
				},
			},
		});
	} else if (props.dialogName == "更新质押池总额") {
		buildMessage({
			from: addr.value.trim(),
			miner_id: Route.query.id,
			msg_type: "propose",
			params: {
				proposal_type: 5,
				proposal_details: {
					new_invested_funds: FilStrToAttoStr(props.parentForm.new_invested_funds),
				},
			},
		});
	} else if (props.dialogName == "投票") {
		buildMessage({
			from: addr.value.trim(),
			miner_id: Route.query.id,
			msg_type: "vote",
			params: {
				proposal_id: props.parentForm.proposal_id,
				approved: props.parentForm.approved,
			},
		});
	} else if (props.dialogName == "提币") {
		buildMessage({
			from: addr.value.trim(),
			miner_id: Route.query.id,
			msg_type: "withdraw",
			params: {
				amount: FilStrToAttoStr(props.parentForm.amount),
			},
		});
	} else if (props.dialogName == "修改质押人地址") {
		loading.value = false;
		const isAdd = props.parentForm.addArr.filter((info) => {
			return new_addr.value == info.addr;
		});
		if (isAdd.length > 0) {
			ElMessage.warning("质押人信息列表钱包地址有重复，请重新输入");
			return;
		}
		loading.value = true;
		buildMessage({
			from: props.parentForm.addr.trim(),
			miner_id: Route.query.id,
			msg_type: "changeInvestor",
			params: {
				new_addr: new_addr.value,
			},
		});
	} else if (props.dialogName == "修改收益人地址") {
		loading.value = false;
		const isAdd = props.parentForm.addArr.filter((info) => {
			return new_addr.value == info.addr;
		});
		if (isAdd.length > 0) {
			ElMessage.warning("收益人信息列表钱包地址有重复，请重新输入");
			return;
		}
		loading.value = true;
		buildMessage({
			from: props.parentForm.addr.trim(),
			miner_id: Route.query.id,
			msg_type: "changeBeneficiary",
			params: {
				new_addr: new_addr.value,
			},
		});
	} else if (props.dialogName == "合约多签") {
		numTimes.value = 0;
		loading.value = false;
		const signer = props.parentForm.signers.find((signer) => signer.addr === addr.value);

		if (signer && signer.update_is_approved == true && signer.register_is_approved == true) {
			ElMessage.warning("该地址已签名");
			return;
		} else if (signer && signer.update_is_approved == false && signer.register_is_approved == false) {
			//false  false
			buildMessage({
				from: addr.value,
				miner_id: props.parentForm.miner_id,
				msg_type: "multisigApprove",
				params: {
					tx_type: "updateBeneficiary",
					msig_addr: props.parentForm.multi_sig_addr, //多签地址
					tx_id: props.parentForm.update_beneficiary_tx_id, // 多签提案编号
				},
			});
		} else if (signer && signer.update_is_approved == true && signer.register_is_approved == false) {
			//true false
			buildMessage({
				from: addr.value,
				miner_id: props.parentForm.miner_id,
				msg_type: "multisigApprove",
				params: {
					tx_type: "registerBeneficiary",
					msig_addr: props.parentForm.multi_sig_addr, //多签地址
					tx_id: props.parentForm.register_beneficiary_tx_id, // 多签提案编号
				},
			});
		} else {
			//false  true
			buildMessage({
				from: addr.value,
				miner_id: props.parentForm.miner_id,
				msg_type: "multisigApprove",
				params: {
					tx_type: "updateBeneficiary",
					msig_addr: props.parentForm.multi_sig_addr, //多签地址
					tx_id: props.parentForm.update_beneficiary_tx_id, // 多签提案编号
				},
			});
		}
		loading.value = true;
		// 多签逻辑
		// 1.主页面搜索多签节点返回数据 code:1101
		// 2.用户点击签名
		// 3.用户输入钱包地址和私钥（或者助记词）
		// 4.用户点击提交
		// 5.检查钱包地址是否在 "signers"中，如果不在，返回报错 “钱包地址必须是多签签名地址”，否则进行下一步
		// 6.检查该钱包地址对应的singers中，update_is_approved，register_is_approved参数，如果全为true.返回报错 "该地址已签名"，否则进行下一步
		// 7.检查update_is_approved是否为false,如果为true->跳转到10步，否则进行下一步
		// 8.构建“多签approve”消息,tx_type=updateBeneficiary,msgi_addr=multi_sig_addr,tx_id=update_beneficiary_tx_id
		// 9.签名后发送，如果返回结果失败则报错，，否则进行下一步
		// 10.检查register_is_approved是否为false,如果为true->跳转到13步，否则进行下一步
		// 11.构建“多签approve”消息,tx_type=registerBeneficiary,msgi_addr=multi_sig_addr,tx_id=register_beneficiary_tx_id
		// 12.签名后发送，如果返回结果失败则报错，否则进行下一步
		// 13.显示gas费，消息链接页面
		// gas费计算规则:第8步，和第11步构建的消息，返回的estimated_cost+value之和，如果有2个消息，就把两个只相加
	}
};
onMounted(() => {});

const pushMessage = async (info) => {
	try {
		const res = await post(sessionStorage.getItem("network") + "/push_message", info);
		num.value += 1;
		if (num.value == 2) {
			colse();
			router.push({
				path: "/prompt",
				query: {
					type: 1,
					msgid: res.data.msg_cid,
					gas: pushData.value,
					sxf: buildData.value[0].value,
					id: props.parentForm.miner_id,
					name: props.dialogName,
				},
			});
		} else {
			let arr1 = JSON.parse(JSON.stringify(props.parentForm.beneficiarys_allot_ratios));
			let arr2 = JSON.parse(JSON.stringify(props.parentForm.investors_allot_ratios));
			arr1.forEach((item) => (item.ratio = parseInt(ratioToInt(item.ratio))));
			arr2.forEach((item) => (item.ratio = parseInt(ratioToInt(item.ratio))));
			buildMessage({
				from: addr.value.trim(),
				miner_id: props.parentForm.miner_id,
				msg_type: "registerBeneficiary",
				params: {
					invested_funds: FilStrToAttoStr(props.parentForm.invested_funds),
					beneficiary_release_height: Number(props.parentForm.beneficiary_release_height),
					invested_release_height: Number(props.parentForm.invested_release_height),
					beneficiarys_allot_ratios: arr1,
					investors_allot_ratios: arr2,
				},
			});
		}
	} catch (error) {
		loading.value = false;
		ElMessage.error(error.msg);
	}
};
const qtpushMessage = async (info) => {
	try {
		const res = await post(sessionStorage.getItem("network") + "/push_message", info);
		colse();
		router.push({
			path: "/prompt",
			query: {
				type: 2,
				msgid: res.data.msg_cid,
				gas: pushData.value,
				sxf: buildData.value[0].value,
				id: Route.query.id,
				name: props.dialogName,
			},
		});
	} catch (error) {
		loading.value = false;
		ElMessage.error(error.msg);
	}
};
const morePushMessage = async (info) => {
	try {
		const res = await post(sessionStorage.getItem("network") + "/push_message", info);

		numTimes.value += 1;
		if (numTimes.value == 2) {
			colse();
			router.push({
				path: "/prompt",
				query: {
					type: 2,
					msgid: res.data.msg_cid,
					gas: pushData.value,
					sxf: buildData.value[0].value,
					id: Route.query.id,
					name: props.dialogName,
				},
			});
		} else {
			buildMessage({
				from: addr.value,
				miner_id: props.parentForm.miner_id,
				msg_type: "multisigApprove",
				params: {
					tx_type: "registerBeneficiary",
					msig_addr: props.parentForm.multi_sig_addr, //多签地址
					tx_id: props.parentForm.register_beneficiary_tx_id, // 多签提案编号
				},
			});
		}
	} catch (error) {
		loading.value = false;
		ElMessage.error(error.msg);
	}
};
const buildMessage = async (info) => {
	try {
		const res = await post(sessionStorage.getItem("network") + "/build_message", {
			...info,
		});
		buildData.value = res.data;
		let newAdd = props.dialogName == "修改质押人地址" || props.dialogName == "修改收益人地址" ? props.parentForm.addr : addr.value;
		if (currencyActive.value == 0) {
			res.data.forEach(async (item) => {
				pushData.value += Number(item.estimated_cost);
				item.msg_cid = new Uint8Array(_decodeBase64(item.msg_cid));
				item.signature = uint8arrayToBase64(await Sigs.SignByPrivateKey(addr_type, password._rawValue, isEqualAddress(newAdd, addrs.value[0]) ? "secp256k1" : "delegated", item.msg_cid)); //私钥签名
			});
		} else {
			res.data.forEach(async (item) => {
				pushData.value += Number(item.estimated_cost);
				item.msg_cid = new Uint8Array(_decodeBase64(item.msg_cid));
				item.signature = uint8arrayToBase64(await Sigs.SignByKeywords(addr_type, passwordStr.value.split(" "), isEqualAddress(newAdd, addrs.value[0]) ? "secp256k1" : "delegated", item.msg_cid)); //助记词签名
			});
		}
		if (props.dialogName == "合约配置") {
			pushMessage(res.data);
		} else if (props.dialogName == "合约多签") {
			morePushMessage(res.data);
		} else {
			qtpushMessage(res.data);
		}
	} catch (error) {
		loading.value = false;
		ElMessage.error(error.msg);
	}
};
const chooseCurrency = (i) => {
	currencyActive.value = i;
};
function sumsSy() {
	if (password2.value.length <= 20) {
		password.value = password2.value;
		return;
	} else if (password2.value.length > 20) {
		const check = password2.value.toString().slice(11, 12);
		if (check == "*") {
			return;
		}
		password = JSON.parse(JSON.stringify(password2));
		const prefix = password2.value.toString().substr(0, 10);
		const suffix = password2.value.toString().substr(password2.length - 10);
		let middle = "******";
		password2.value = prefix + middle + suffix;
	}
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
	background: #dbefff;
	border-radius: 3px;
	opacity: 1;
	border: 1px solid #0090ff;
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
<style scoped>
.mar_30 {
	margin-top: 30px;
}

.marb_10 {
	margin-bottom: 10px;
}

.line {
	border-top: 2px solid #c9c7c7;
}
</style>
