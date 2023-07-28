<template>
	<el-dialog :title="dialogName" v-model="dialogVisible" width="850px" @close="colse">
		<div class="container">
			<div class="container-content">
				<div class="formInfo" style="padding-bottom: 0">
					<div class="item">
						<div>节点编号</div>
						<div>{{ props.parentForm2.miner_id }}</div>
					</div>
					<div class="item">
						<div>Beneficiary权限参数</div>
						<div>
							<span style="margin-left: 0 !important">区块高度：{{ props.parentForm2.new_expiration }}</span> <span>授权截止期限：{{ props.parentForm2.date3 }}</span>
						</div>
					</div>
					<div class="item">
						<div>
							<div style="margin-left: 180px; color: #606266">提币额度上限：{{ props.parentForm2.new_quota }}&nbsp;FIL</div>
						</div>
					</div>

					<div class="item">
						<div>产出收益起始释放高度</div>
						<div>{{ props.parentForm2.beneficiary_release_height }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;授权截止期限：{{ props.parentForm2.date1 }}</div>
					</div>
					<div class="item">
						<div>质押退还起始释放高度</div>
						<div>{{ props.parentForm2.invested_release_height }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;授权截止期限：{{ props.parentForm2.date2 }}</div>
					</div>
				</div>
				<div class="formInfo">
					<div class="title">收益人信息（产出收益）</div>
					<div class="item" v-for="(item, i) in props.parentForm2.beneficiarys_allot_ratios" :key="i">
						<div>收益人{{ i + 1 }}</div>
						<div style="width: 65%">
							<span style="margin-left: 0 !important;margin-right 10px;width:100%;float:left">{{ item.addr ? item.addr : "未知" }}</span>
							<br /><span style="margin-left: 0 !important">占比：{{ item.ratio }}%</span>
						</div>
					</div>
					<div class="sum">
						<span class="left_sum"> 合计： </span><span class="line_height">{{ props.parentForm2.sums }}</span>
					</div>
				</div>
				<div class="formInfo" style="border: 0">
					<div class="title">质押人信息（质押退还）</div>
					<div class="item">
						<div>质押池总额</div>
						<div v-if="props.parentForm2.invested_funds">{{ props.parentForm2.invested_funds }}</div>
					</div>
					<div class="item" v-for="(item, i) in props.parentForm2.investors_allot_ratios" :key="i">
						<div>质押人{{ i + 1 }}</div>
						<div style="width: 65%">
							<span style="margin-left: 0 !important;margin-right 10px;width:100%;float:left">{{ item.addr ? item.addr : "未知" }}</span>
							<br /><span style="margin-left: 0 !important">占比：{{ item.ratio }}%</span>
						</div>
					</div>
					<div class="sum">
						<span class="left_sum"> 合计： </span><span class="line_height">{{ props.parentForm2.sumsT }}</span>
					</div>
				</div>
			</div>
		</div>
	</el-dialog>
</template>
<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { get } from "@/utils/request";
import { getTimestamp, getHeight } from "@/utils/date";
import { convert_fil } from "@/utils/tool";
const store = useStore();
const Route = useRoute();
// const getAssetsFile = (url) => {
//   return new URL(`@/assets/${url}`, import.meta.url).href
// }
const form = reactive({
	addr: "",
	addArr: [],
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
	parentForm2: {
		type: String,
		default: null,
	},
});

const dialogVisible = ref(false);
const getDate1 = ref("");
const getDate2 = ref("");
const getDate3 = ref("");
const visible_resgister = ref(false);
const dataform = ref("");
const dialogName = ref("合约配置预览");
const emit = defineEmits(["update:show"]);
watch(
	() => props.show,
	(newValue) => {
		dialogVisible.value = newValue;
	},
	{ immediate: true }
);

const colse = () => {
	dialogVisible.value = false;
	emit("update:show", false);
};
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
.left_sum {
	float: left;
	margin-left: 180px;
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
	padding: 0 34px 40px 34px;

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
