<template>
	<div class="collapse" v-if="store.state.headTittle != '合约多签'" :class="show ? 'collapseHeight' : ''">
		<el-icon>
			<bell />
		</el-icon>
		未查询到已生效的合约配置，请根据提示配置需要的合约参数。如配置已提交但在上链中，请忽略以下内容并等待上链更新！
	</div>
	<div class="collapse" v-else :class="show ? 'collapseHeight' : ''">
		<el-icon>
			<bell />
		</el-icon>
		合约需要Owner角色全部签名才能正式生成，合约配置者默认已签名，
	</div>
	<div class="container">
		<div class="tops">
			<img src="@/assets/zjc.png" alt="" />注：合约配置需由OWNER角色提交（多签
			OWNER地址需由其中之一提交，依次完成签名）方可执行。钱包地址需使用去中心化钱包地址（持有私钥/助记词），交易所地址不可使用。
		</div>
		<div class="formInfo">
			<el-form :model="form" ref="target" :rules="rules" label-position="left" label-width="180px" class="ruleForm" :hide-required-asterisk="true">
				<el-form-item label="节点编号" prop="miner_id">
					<el-input v-model="form.miner_id" placeholder="请输入节点编号" style="width: 400px"></el-input>
				</el-form-item>
				<el-form-item label="Beneficiary授权参数" prop="new_expiration">
					<el-input v-model="form.new_expiration" placeholder="请输入区块高度" @change="FilStrToAttoStr(form.new_expiration)" @blur="getTime(form.new_expiration, 3)" style="width: 180px"></el-input>
					<img src="@/assets/change.png" alt="" />
					<el-date-picker v-model="form.date3" type="datetime" @change="setHeight(3)" placeholder="请输入授权截止期限" style="width: 180px"> </el-date-picker>
					<div class="tips">
						<el-tooltip class="item" effect="light" content="建议设置为扇区最迟到期日+210天以上" placement="right">
							<el-icon>
								<question-filled />
							</el-icon>
						</el-tooltip>
					</div>
				</el-form-item>
				<el-form-item label="" prop="new_quota">
					<el-input v-model="form.new_quota" @change="FilStrToAttoStr(form.new_quota)" placeholder="请输入提币额度上限" style="width: 400px">
						<template #suffix>
							<span>FIL</span>
						</template></el-input
					>
					<div class="tips">
						<el-tooltip class="item" effect="light" content="建议按照质押池+150%预期产出进行设置，若节点号不再重复封装可设置为无限大" placement="right">
							<el-icon>
								<question-filled />
							</el-icon>
						</el-tooltip>
					</div>
				</el-form-item>
				<el-form-item label="产出收益起始释放高度" prop="beneficiary_release_height">
					<el-input v-model="form.beneficiary_release_height" placeholder="请输入区块高度" @blur="getTime(form.beneficiary_release_height, 1)" style="width: 180px"></el-input>
					<img src="@/assets/change.png" alt="" />
					<el-date-picker v-model="form.date1" type="datetime" @change="setHeight(1)" placeholder="请输入授权截止期限" style="width: 180px"> </el-date-picker>
					<div class="tips">
						<el-tooltip class="item" effect="light" content="该日期需早于质押退还起始释放日期" placement="right">
							<el-icon>
								<question-filled />
							</el-icon>
						</el-tooltip>
					</div>
				</el-form-item>
				<el-form-item label="质押退还起始释放高度" prop="invested_release_height">
					<el-input v-model="form.invested_release_height" placeholder="请输入区块高度" @blur="getTime(form.invested_release_height, 2)" style="width: 180px"></el-input>
					<img src="@/assets/change.png" alt="" />
					<el-date-picker v-model="form.date2" type="datetime" @change="setHeight(2)" placeholder="请输入授权截止期限" style="width: 180px"> </el-date-picker>
					<div class="tips">
						<el-tooltip class="item" effect="light" content="该日期需晚于产出收益起始释放日期" placement="right">
							<el-icon>
								<question-filled />
							</el-icon>
						</el-tooltip>
					</div>
				</el-form-item>
				<div class="title">收益人信息（产出收益）</div>
				<el-form-item
					:label="'收益人' + (i + 1)"
					v-for="(item, i) in form.beneficiarys_allot_ratios"
					:key="i"
					:prop="`beneficiarys_allot_ratios[${i}].addr`"
					:rules="[{ required: true, message: '请填写收益人地址', trigger: 'blur' }]"
					@keyup="sumsSy"
				>
					<el-input style="width: 300px" v-model="item.addr" placeholder="请填写收益人地址"></el-input>
					<el-input
						style="width: 90px; margin: 0 10px"
						v-model="item.ratio"
						onkeyup="value=value.match(/\d+\.?\d{0,4}/)"
						oninput="value=value.replace(/(^\.|[^\d\.])/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.').replace(/^\d{3,}.*/,'100')"
						placeholder="0"
						><template #suffix> % </template>
					</el-input>
					<span class="el-icon-minus" @click="delbeneficiarys(i)">
						<el-icon>
							<minus />
						</el-icon>
					</span>
				</el-form-item>
				<div class="add" @click="addbeneficiarys">
					<span class="el-icon-plus">
						<el-icon>
							<plus />
						</el-icon>
					</span>
					增加收益人
					<div class="sum">
						<span class="left_sum"> 合计： </span><span>{{ form.sums }}</span>
					</div>
				</div>
				<div class="title">质押人信息（质押退还）</div>
				<el-form-item label="质押池总额" prop="invested_funds">
					<el-input style="width: 400px" v-model="form.invested_funds" @change="FilStrToAttoStr(form.invested_funds)" placeholder="请输入总质押币">
						<template #suffix>
							<span>FIL</span>
						</template></el-input
					>
				</el-form-item>
				<el-form-item
					:label="'质押人' + (i + 1)"
					v-for="(item, i) in form.investors_allot_ratios"
					:key="i"
					:prop="`investors_allot_ratios[${i}].addr`"
					:rules="[{ required: true, message: '请填写质押人地址', trigger: 'blur' }]"
					@keyup="sumsST"
				>
					<el-input style="width: 300px" v-model="item.addr" placeholder="请填写质押人地址"></el-input>
					<el-input
						style="width: 90px; margin: 0 10px"
						v-model="item.ratio"
						placeholder="0"
						onkeyup="value=value.match(/\d+\.?\d{0,4}/)"
						oninput="value=value.replace(/(^\.|[^\d\.])/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.').replace(/^\d{3,}.*/,'100')"
					>
						<template #suffix> % </template></el-input
					>
					<span class="el-icon-minus" @click="delinvestors(i)">
						<el-icon>
							<minus />
						</el-icon>
					</span>
				</el-form-item>
				<div class="add" @click="addinvestors">
					<span class="el-icon-plus">
						<el-icon>
							<plus />
						</el-icon>
					</span>
					增加质押人
					<div class="sum">
						<span class="left_sum"> 合计： </span><span>{{ form.sumsT }}</span>
					</div>
				</div>
			</el-form>
		</div>
		<div class="submitForm">
			<el-form-item>
				<el-checkbox v-model="form.checked">我已确认所有钱包为去中心化钱包地址(持有私钥/助记词)</el-checkbox>
			</el-form-item>
			<el-button @click="submit" class="submit">提交</el-button>
			<el-button @click="lookAmount">预览</el-button>
			<el-button @click="$router.go(-1)">返回</el-button>
		</div>
		<signature :dialogName="'合约配置'" :parentForm="form" v-model:show="visible"></signature>
		<registershow :dialogName="'合约预览'" :parentForm2="form" v-model:show="visible_resgister"></registershow>
	</div>
</template>
<script setup>
import { onMounted, reactive, ref, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { getTimestamp, getHeight } from "@/utils/date";
import { useStore } from "vuex";
import signature from "@/components/signature.vue";
import registershow from "@/components/registershow.vue";
const store = useStore();
const Route = useRoute();
const show = ref(false);
const visible = ref(false);
const visible_resgister = ref(false);
const target = ref(null);
const rules = reactive({
	invested_funds: [{ required: true, message: "请输入总质押币", trigger: "blur" }],
	miner_id: [{ required: true, message: "请输入节点编号", trigger: "blur" }],
	new_expiration: [{ required: true, message: "请输入区块高度", trigger: "blur" }],
	beneficiary_release_height: [{ required: true, message: "请输入区块高度", trigger: "blur" }],
	invested_release_height: [{ required: true, message: "请输入区块高度", trigger: "blur" }],
	new_quota: [{ required: true, message: "请输入提币额度上限", trigger: "blur" }],
});
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
});
onMounted(() => {
	systeminfo();
});
const systeminfo = async () => {
	try {
		const res = await get(`system_info`);
		dataform.value = res.data.networks;
		if (sessionStorage.getItem("network")) {
			let info = dataform.value.filter((item) => item.name == sessionStorage.getItem("network"));
			store.commit("set_headInfo", info[0]);
			activeNetwork.value = sessionStorage.getItem("network");
		} else {
			activeNetwork.value = dataform.value[0].name;
			store.commit("set_headInfo", dataform.value[0]);
			sessionStorage.setItem("network", activeNetwork.value);
		}
	} catch (error) {
		// ElMessage.warning(error.msg);
	}
	// input.value=Route.query.id
};
function FilStrToAttoStr(value) {
	if (typeof value !== "string") {
		throw new Error("illegal parameter type:" + typeof value);
	}

	let values = value.split(".");
	if (values.length === 0 || values.length > 2) {
		throw new Error("illegal value: " + value);
	}

	let intPart = BigInt(values[0]) * BigInt(10 ** 18);
	let fractionalPart = BigInt(0);
	if (values.length > 1) {
		let b = values[1];
		if (b.length === 0) {
			b = 0;
		} else if (b.length > 18) {
			b = b.substring(0, 18);
		} else {
			while (b.length < 18) {
				b = b + "0";
			}
		}

		fractionalPart = BigInt(b);
	}

	let result = intPart + fractionalPart;
	return result.toString();
}
function sumsSy() {
	let sum = 0;
	let hasRatio = [];
	form.beneficiarys_allot_ratios.forEach((item) => {
		item.ratio.trim() != "" && hasRatio.push(item.ratio);
		sum += Number(FilStrToAttoStrAndNum(item.ratio));
	});
	form.sums = sum / 10000 + "%";
}
function sumsST() {
	let sum = 0;
	let hasRatio = [];
	form.investors_allot_ratios.forEach((item) => {
		item.ratio.trim() != "" && hasRatio.push(item.ratio);
		sum += Number(FilStrToAttoStrAndNum(item.ratio));
	});
	form.sumsT = sum / 10000 + "%";
}
function FilStrToAttoStrAndNum(value) {
	if (typeof value !== "string") {
		throw new Error("illegal parameter type:" + typeof value);
	}

	let values = value.split(".");
	if (values.length === 0 || values.length > 2) {
		throw new Error("illegal value: " + value);
	}

	let intPart = BigInt(values[0]) * BigInt(10 ** 4);
	let fractionalPart = BigInt(0);
	if (values.length > 1) {
		let b = values[1];
		if (b.length === 0) {
			b = 0;
		} else if (b.length > 4) {
			b = b.substring(0, 4);
		} else {
			while (b.length < 4) {
				b = b + "0";
			}
		}

		fractionalPart = BigInt(b);
	}

	let result = intPart + fractionalPart;
	return result.toString();
}

onMounted(() => {
	setTimeout(() => {
		show.value = Route.query.show;
	}, 500);
});
const addbeneficiarys = () => {
	form.beneficiarys_allot_ratios.push({
		addr: "",
		ratio: "",
	});
};
const addinvestors = () => {
	form.investors_allot_ratios.push({
		addr: "",
		ratio: "",
	});
};
const delbeneficiarys = (i) => {
	if (form.beneficiarys_allot_ratios.length == 1) {
		ElMessage.warning("最少保留一条信息");
		let sum = 0;
		let hasRatio = [];
		form.beneficiarys_allot_ratios.forEach((item) => {
			item.ratio.trim() != "" && hasRatio.push(item.ratio);
			sum += Number(FilStrToAttoStrAndNum(item.ratio));
		});
		form.sums = sum / 10000 + "%";
	} else {
		form.beneficiarys_allot_ratios.splice(i, 1);
		let sum = 0;
		let hasRatio = [];
		form.beneficiarys_allot_ratios.forEach((item) => {
			item.ratio.trim() != "" && hasRatio.push(item.ratio);
			sum += Number(FilStrToAttoStrAndNum(item.ratio));
		});
		form.sums = sum / 10000 + "%";
	}
};
const delinvestors = (i) => {
	if (form.investors_allot_ratios.length == 1) {
		ElMessage.warning("最少保留一条信息");
		let sum = 0;
		let hasRatio = [];
		form.investors_allot_ratios.forEach((item) => {
			item.ratio.trim() != "" && hasRatio.push(item.ratio);
			sum += Number(FilStrToAttoStrAndNum(item.ratio));
		});
		form.sumsT = sum / 10000 + "%";
	} else {
		form.investors_allot_ratios.splice(i, 1);
		let sum = 0;
		let hasRatio = [];
		form.investors_allot_ratios.forEach((item) => {
			item.ratio.trim() != "" && hasRatio.push(item.ratio);
			sum += Number(FilStrToAttoStrAndNum(item.ratio));
		});
		form.sumsT = sum / 10000 + "%";
	}
};
const getTime = (height, type) => {
	if (height == "") return;
	const { start_at, block_delay_secs } = store.state.headInfo;
	const d = getTimestamp(start_at, block_delay_secs, height);
	if (type == 1) {
		form.date1 = d;
	} else if (type == 2) {
		form.date2 = d;
	} else {
		form.date3 = d;
	}
};
const setHeight = (type) => {
	const { start_at, block_delay_secs } = store.state.headInfo;
	let date = new Date(type == 1 ? form.date1 : type == 2 ? form.date2 : form.date3);
	const { height, revision_time } = getHeight(start_at, block_delay_secs, date.getTime() / 1000);
	if (type == 1) {
		form.beneficiary_release_height = height;
		form.date1 = revision_time;
	} else if (type == 2) {
		form.invested_release_height = height;
		form.date2 = revision_time;
	} else {
		form.new_expiration = height;
		form.date3 = revision_time;
	}
};
const submit = async () => {
	if (form.checked == false) return ElMessage.warning("请勾选我已确认所有钱包为去中心化钱包地址");

	if (new Date(form.date1) > new Date(form.date2)) return ElMessage.error("产出收益需早于质押退还起始释放日期");
	const valid = await target.value.validate();
	if (valid) {
		if (form.beneficiarys_allot_ratios.length > 0) {
			let sum = 0;
			let hasRatio = [];
			form.beneficiarys_allot_ratios.forEach((item) => {
				item.ratio.trim() != "" && hasRatio.push(item.ratio);
				sum += Number(FilStrToAttoStrAndNum(item.ratio));
				form.sums = sum / 10000 + "%";
			});
			if (sum != 1000000) {
				ElMessage.warning("收益人比例总和需为100%，请重新分配");
				return;
			}
		}

		if (form.investors_allot_ratios.length > 0) {
			let sum = 0;
			form.investors_allot_ratios.forEach((item) => {
				sum += Number(FilStrToAttoStrAndNum(item.ratio));
				form.sumsT = sum / 10000 + "%";
			});
			if (sum != 1000000) {
				ElMessage.warning("质押人比例总和需为100%，请重新分配");
				return;
			}
		}
		visible.value = true;
	}
};
const lookAmount = async () => {
	if (form.checked == false) return ElMessage.warning("请勾选我已确认所有钱包为去中心化钱包地址");
	const valid = await target.value.validate();
	if (valid) {
		visible_resgister.value = true;
	}
};

defineExpose({
	form,
});
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
		border-bottom: 1px solid #d3d6d8;
		padding: 40px 0;

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
