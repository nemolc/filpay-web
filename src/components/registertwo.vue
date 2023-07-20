<template>
	<div class="collapse collapseHeight">
		<el-icon>
			<bell />
		</el-icon>
		合约需要Owner角色全部签名才能正式生成，合约配置者默认已签名，无需重复签名.
	</div>
	<div class="container">
		<div class="formInfo" style="padding-bottom: 0">
			<div class="item">
				<div>节点编号</div>
				<div>{{ form.miner_id }}</div>
			</div>
			<div class="item">
				<div>Beneficiary权限参数</div>
				<div>
					<span>区块高度：{{ form.new_expiration }}</span> <span>授权截止期限：{{ form.date3 }}</span>
				</div>
			</div>
			<div class="item">
				<div style="width: 100%">
					<div style="width: 100%; margin-left: 200px; color: #000">提币额度上限：{{ form.new_quota / 10 ** 18 }}&nbsp;FIL</div>
				</div>
			</div>

			<div class="item">
				<div>产出收益起始释放高度</div>
				<div>{{ form.beneficiary_release_height }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;授权截止期限：{{ form.date1 }}</div>
			</div>
			<div class="item">
				<div>质押退还起始释放高度</div>
				<div>{{ form.invested_release_height }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;授权截止期限：{{ form.date2 }}</div>
			</div>
		</div>
		<div class="formInfo">
			<div class="title">收益人信息（产出收益）</div>
			<div class="item" v-for="(item, i) in form.beneficiarys_allot_ratios" :key="i">
				<div>收益人{{ i + 1 }}</div>
				<div>
					<span>{{ item.addr ? item.addr : "未知" }}</span>
					<span>占比：{{ item.ratio / 10000 }}%</span>
				</div>
			</div>
			<!-- <div class="sum">
					<span class="left_sum"> 合计： </span><span class="line_height">{{ form.sums }}</span>
				</div> -->
		</div>
		<div class="formInfo" style="border: 0">
			<div class="title">质押人信息（质押退还）</div>
			<div class="item">
				<div>质押币总额</div>
				<div v-if="form.invested_funds">{{ form.invested_funds / 10 ** 18 }}</div>
			</div>
			<div class="item" v-for="(item, i) in form.investors_allot_ratios" :key="i">
				<div>质押人{{ i + 1 }}</div>
				<div>
					<span>{{ item.addr ? item.addr : "未知" }}</span>
					<span>占比：{{ item.ratio / 10000 }}%</span>
				</div>
			</div>
			<!-- <div class="sum">
					<span class="left_sum"> 合计： </span><span class="line_height">{{ form.sumsT }}</span>
				</div> -->
		</div>
		<div class="voteResult">
			<div>
				签名状态<span>({{ signedCount }}/ {{ form.signers.length }})</span>
			</div>
			<ul>
				<li v-for="(item, i) in form.signers" :key="i">
					{{ item.addr
					}}<span>{{
						(item.update_is_approved == false && item.register_is_approved == false) ||
						(item.update_is_approved == false && item.register_is_approved == true) ||
						(item.update_is_approved == true && item.register_is_approved == false)
							? "未签名"
							: "已签名"
					}}</span>
				</li>
			</ul>
		</div>
		<el-button @click="submit" class="submit">我是Owner多签集成员，立即签名</el-button>

		<signature :dialogName="'合约多签'" :parentForm="form" v-model:show="visible"></signature>
	</div>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { get } from "@/utils/request";
import { getTimestamp, getHeight } from "@/utils/date";
import { convert_fil } from "@/utils/tool";
import signature from "@/components/signature.vue";
const store = useStore();
const Route = useRoute();
const visible = ref(false);
const target = ref(null);
// const getAssetsFile = (url) => {
//   return new URL(`@/assets/${url}`, import.meta.url).href
// }
const form = reactive({
	miner_id: "",
	invested_funds: "", //质押金额 此字符串是个大数值
	beneficiary_release_height: "", //产出收益起始释放高度
	invested_release_height: "", //质押退还起始释放高度
	new_expiration: "",
	new_quota: "",
	date1: "",
	date2: "",
	date3: "",
	sums: "",
	sumsT: "",
	checked: "",
	beneficiarys_allot_ratios: [
		{
			addr: "",
			ratio: "",
		},
	], //收益人信息
	investors_allot_ratios: [
		{
			addr: "",
			ratio: "",
		},
	], //质押人信息
	signers: "",
	multi_sig_addr: "",
	update_beneficiary_tx_id: "",
	register_beneficiary_tx_id: "",
});
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

const getDate1 = ref("");
const getDate2 = ref("");
const getDate3 = ref("");
const signedCount = ref("");
const visible_resgister = ref(false);
const dataform = ref("");
const emit = defineEmits(["update:show"]);
var code = store.state.code;

onMounted(() => {
	setTimeout(() => {
		contractdetails();
	}, 200);
});
const contractdetails = async () => {
	try {
		const res = await get(`${sessionStorage.getItem("network")}/${Route.query.id}/contract_details`);

		const { start_at, block_delay_secs } = store.state.headInfo;
		form.date3 = getTimestamp(start_at, block_delay_secs, res.data.expiration);
		form.miner_id = res.data.miner_id;
		form.new_expiration = res.data.expiration;
		form.date3 = res.data.miner_id;
		form.new_quota = res.data.quota;
		form.beneficiary_release_height = res.data.beneficiary_release_height;
		form.date1 = getTimestamp(start_at, block_delay_secs, res.data.beneficiary_release_height);
		form.invested_release_height = res.data.investor_release_height;
		form.date2 = getTimestamp(start_at, block_delay_secs, res.data.investor_release_height);
		form.beneficiarys_allot_ratios = res.data.beneficiarys_info;
		form.invested_funds = res.data.invested_funds;
		form.investors_allot_ratios = res.data.investors_info;
		form.signers = res.data.signers;
		form.multi_sig_addr = res.data.multi_sig_addr;
		form.update_beneficiary_tx_id = res.data.update_beneficiary_tx_id;
		form.register_beneficiary_tx_id = res.data.register_beneficiary_tx_id;
		signedCount = form.signers.reduce((count, item) => {
			if (item.update_is_approved && item.register_is_approved) {
				return count + 1;
			} else {
				return count;
			}
		}, 0);
	} catch (error) {
		if (error.code == 1101) {
			const { start_at, block_delay_secs } = store.state.headInfo;
			form.date3 = getTimestamp(start_at, block_delay_secs, error.data.expiration);
			form.miner_id = error.data.miner_id;
			form.new_expiration = error.data.expiration;
			form.new_quota = error.data.quota;
			form.beneficiary_release_height = error.data.beneficiary_release_height;
			form.date1 = getTimestamp(start_at, block_delay_secs, error.data.beneficiary_release_height);
			form.invested_release_height = error.data.invested_release_height;
			form.date2 = getTimestamp(start_at, block_delay_secs, error.data.invested_release_height);
			form.beneficiarys_allot_ratios = error.data.beneficiarys_info;
			form.invested_funds = error.data.invested_funds;
			form.investors_allot_ratios = error.data.investors_info;
			form.signers = error.data.signers;
			form.multi_sig_addr = error.data.multi_sig_addr;
			form.update_beneficiary_tx_id = error.data.update_beneficiary_tx_id;
			form.register_beneficiary_tx_id = error.data.register_beneficiary_tx_id;
		} else {
			ElMessage.warning(error.msg);
		}
	}
};

function submit() {
	visible.value = true;
}
contractdetails();
</script>
<style lang="less" scoped>
.tops {
	font-size: 16px;
	display: flex;
	align-items: center;
	padding-top: 33px;
	font-weight: 500;
	color: #000;

	img {
		width: 20px;
		margin-right: 10px;
	}
}

.collapseHeight {
	height: 60px !important;
	border: 1px solid #0090ff;
}

.collapse {
	font-size: 16px;
	background: #dbefff;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 60px;
	left: 200px;
	z-index: 10;
	width: calc(100% - 200px);
	height: 0;
	overflow: hidden;
	transition: height 0.2s;

	i {
		margin-right: 5px;
	}
}

.tips {
	position: absolute;
	left: 410px;
	font-size: 18px;
	top: 2px;
	color: #999;
	cursor: pointer;
}

.date {
	color: #999;
	margin-top: 5px;
	display: flex;
	align-items: center;

	span {
		margin-left: 5px;
	}
}

.container {
	background: #ffffff;
	box-shadow: 0px 3px 6px 1px rgba(160, 160, 160, 0.16);
	border-radius: 3px;
	padding: 0 34px 40px 34px;
	margin-top: 26px;
	min-height: calc(100vh - 150px);

	.ruleForm {
		color: #000;
	}

	.formInfo {
		padding: 20px 0;

		img {
			width: 20px;
			margin: 0 10px;
		}

		.title {
			border-top: 1px solid #d3d6d8;
			margin: 50px 0;
			padding-top: 40px;
			font-weight: 500;
		}
	}

	.el-icon-minus {
		border: 1px solid #d3d6d8 !important;
		color: #000 !important;
		cursor: pointer;
	}

	.el-icon-minus,
	.el-icon-plus {
		border: 1px solid #0090ff;
		border-radius: 3px;
		padding: 5px;
		font-size: 12px;
		font-weight: bold;
		margin-right: 10px;
		display: flex;
	}

	.add {
		font-size: 14px;
		color: #0090ff;
		cursor: pointer;
		margin-left: 180px;
		display: flex;
		align-items: center;
	}

	.submitForm {
		margin: 30px 0 0 180px;

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
}
.sum {
	width: 500px;
	color: #7b7878;
	float: left;
}
.left_sum {
	margin-left: 206px;
}
</style>
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
.left_sum {
	float: left;
	margin-left: 520px;
}
.line_height {
	line-height: 22px;
}
.container {
	min-height: calc(100vh - 150px);
}

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
	padding: 22px 34px 40px 34px;

	.ruleForm {
		color: #000;
	}

	.formInfo {
		.item {
			display: flex;
			align-items: center;
			margin-bottom: 40px;

			& div:first-child {
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
<style lang="less" scoped>
.collapse {
	font-size: 16px;
	background: #dbefff;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 60px;
	left: 200px;
	z-index: 10;
	width: calc(100% - 200px);
	height: 0;
	overflow: hidden;
	transition: height 0.2s;

	i {
		margin-right: 5px;
	}
}
.collapseHeight {
	height: 60px !important;
	border: 1px solid #0090ff;
}
.vote {
	width: 560px;
	border: 1px solid #d3d6d8;
	border-radius: 10px;
	margin-bottom: 40px;
	overflow: hidden;

	.title {
		padding: 0 20px;
		height: 60px;
		line-height: 60px;
		font-weight: bold;
		border-bottom: 1px solid #d3d6d8;
		font-size: 18px;
	}

	.content {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 40px 0;
	}

	.bottom {
		background: #eeeeee;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 90px;
	}

	.voteBtn {
		width: 180px;
		height: 40px;
		text-align: center;
		line-height: 40px;
		border-radius: 10px;
		border: 1px solid #a8a8a8;
		cursor: pointer;
		position: relative;
		margin: 0 10px;

		i {
			position: absolute;
			font-size: 18px;
			color: #0090ff;
			left: 10px;
			top: 10px;
		}
	}

	.select {
		border: 1px solid #0090ff;
		color: #0090ff;
	}

	.primary {
		width: 400px;
		border: 1px solid #0090ff;
		background: #0090ff;
		color: #fff;
	}
}

.voteResult {
	width: 560px;
	border: 1px solid #d3d6d8;
	border-radius: 10px;

	div,
	li {
		padding: 15px 20px;
		font-size: 14px;
		list-style: none;
		border-top: 1px solid #d3d6d8;
		line-height: 30px;
	}

	span {
		margin-left: 30px;
	}

	div {
		border: 0 !important;
		font-weight: bold;
		font-size: 18px;
	}
}

.card {
	display: flex;
	justify-content: space-between;
	background: #ffffff;
	box-shadow: 0px 3px 6px 1px rgba(160, 160, 160, 0.16);
	margin-top: 26px;
	border-radius: 3px;
	padding: 20px 32px;
	align-items: center;

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

.btn {
	width: 100px;
	height: 32px;
	border-radius: 32px;
	color: #fff;
	text-align: center;
	font-size: 16px;
	line-height: 32px;
}

.bgUnderway {
	background: #e7e7e7;
}

.bgSuccess {
	background: #eafff2;
}

.bgError {
	background: #ffeaea;
}

.underway {
	background: #acacac;
}

.primary {
	background: #00d1f2;
}

.success {
	background: #28de6b;
}

.error {
	background: #e94141;
}
.minheight {
	min-height: calc(100vh - 150px);
	margin-top: 26px;
}
.container {
	background: #ffffff;
	box-shadow: 0px 3px 6px 1px rgba(160, 160, 160, 0.16);
	border-radius: 3px;
	padding: 0 34px 40px 34px;
	margin-top: 26px;
	min-height: calc(100vh - 150px);

	.formInfo {
		padding: 40px 0;

		.item {
			display: flex;
			align-items: center;
			margin-top: 40px;

			& div:first-child {
				color: #a8a8a8;
				margin-right: 40px;
			}

			span {
				margin: 0 20px;
			}
		}

		.title {
			margin-bottom: 16px;
			font-weight: 500;
		}
	}
}
.border_tab {
	width: 800px;
	border: 1px solid #acacac;
}
.border_bottom {
	padding-bottom: 20px;
	height: 20px;
	line-height: 20px;
	flex-wrap: wrap;
}
.submit {
	background: #0090ff;
	color: #fff;
	margin-top: 30px;
	margin-left: 100px;
}
</style>
