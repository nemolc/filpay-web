<template>
	<div class="formInfo">
		<el-form ref="target" :model="form" label-position="left" label-width="153px" :hide-required-asterisk="true">
			<el-form-item
				:label="'收益人' + (i + 1)"
				v-for="(item, i) in form.new_allot_ratios"
				:key="i"
				:prop="`new_allot_ratios[${i}].addr`"
				:rules="[{ required: true, message: '请填写收益人地址', trigger: 'blur' }]"
			>
				<el-input style="width: 300px" v-model="item.addr" placeholder="请填写收益人地址"></el-input>
				<el-input
					style="width: 90px; margin: 0 10px"
					v-model="item.ratio"
					placeholder="0"
					oninput="value=value.replace(/(^\.|[^\d\.])/g,'').replace('.','$#$').replace(/\./g,'').replace('$#$','.').replace(/^\d{3,}.*/,'100')"
					><template #suffix>%</template></el-input
				>
				<span class="el-icon-minus" @click="delbeneficiarys(i)">
					<el-icon>
						<minus />
					</el-icon>
				</span>
			</el-form-item>
		</el-form>
		<div class="add" @click="addbeneficiarys">
			<span class="el-icon-plus">
				<el-icon>
					<plus />
				</el-icon>
			</span>
			增加收益人
		</div>
	</div>
	<div class="submitForm"><el-button class="submit" @click="submit">提交</el-button><el-button @click="back">返回</el-button></div>
	<signature :dialogName="'变更收益人比例'" :parentForm="form" v-model:show="visible"></signature>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import signature from "@/components/signature.vue";
import { useStore } from "vuex";
const store = useStore();
const target = ref(null);
const visible = ref(false);
const form = reactive({
	new_allot_ratios: [
		{
			addr: "",
			ratio: "",
		},
		{
			addr: "",
			ratio: "",
		},
	],
});
const addbeneficiarys = () => {
	form.new_allot_ratios.push({
		addr: "",
		ratio: "",
	});
};
const delbeneficiarys = (i) => {
	if (form.new_allot_ratios.length == 1) {
		ElMessage.warning("最少保留一条信息");
	} else {
		form.new_allot_ratios.splice(i, 1);
	}
};
const submit = async () => {
	const valid = await target.value.validate();
	if (valid) {
		if (form.new_allot_ratios.length > 0) {
			let sum = 0;
			form.new_allot_ratios.forEach((item) => {
				sum += Number(item.ratio);
			});
			if (sum != 100) {
				ElMessage.warning("收益人比例总和需为100%，请重新分配");
				return;
			}
		}
		visible.value = true;
	}
};
const props = defineProps({
	details: {
		type: String,
		default: null,
	},
	show: {
		type: Boolean,
		default: null,
	},
});
const emit = defineEmits(["update:show"]);
const back = () => {
	store.commit("set_activename", "发起提案");
	emit("update:show", false);
};
onMounted(() => {});
</script>
<style lang="less" scoped>
.formInfo {
	border-bottom: 1px solid #d3d6d8;
	padding: 40px 0;

	img {
		width: 20px;
		margin: 0 10px;
	}

	.title {
		margin-bottom: 50px;
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
	margin-left: 153px;
	display: flex;
}

.submitForm {
	margin: 30px 0 0 153px;

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
</style>
