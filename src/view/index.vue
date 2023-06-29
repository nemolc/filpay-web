<template>
	<div class="container">
		<div class="home">
			<div>
				<div class="title"><img src="@/assets/logo.png" /></div>
				<div style="color: #828384; font-size: 22px; letter-spacing: 2px">您放心的合约支付管家</div>
				<div>
					<el-input v-model="input" @keyup.enter="searchValue" placeholder="输入节点号查看或配置" class="searchInput">
						<template #suffix>
							<el-icon style="font-size: 26px" @click="searchValue">
								<search />
							</el-icon>
						</template>
					</el-input>
				</div>
				<div class="register">更多操作请查阅<span @click="register">说明文档</span></div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { get } from "@/utils/request";
import { ElMessage } from "element-plus";
const router = useRouter();
const input = ref(null);
var iptval = "";
const searchValue = () => {
	if (input.value && input.value.length > 0 && input.value.split(" ").join("").length > 0) {
		iptval = input.value.trim();
	} else {
		router.push({ path: "/register", query: { show: "ture" } });
		return;
	}
	contractdetails();
};
const contractdetails = async () => {
	try {
		await get(`${sessionStorage.getItem("network")}/${iptval}/contract_details`);
		router.push({ path: "/contractDetail", query: { id: input.value } });
	} catch (error) {
		if (error.code == 404 || error.code == 1001) {
			router.push({ path: "/register", query: { show: "ture" } });
		} else {
			ElMessage.warning(error.msg);
		}
	}
};
const register = () => {
	router.push({ path: "/documents/FILPAY" });
};
</script>
<style lang="less" scoped>
.container {
	height: calc(100vh - 60px);
}

:deep(.el-input__suffix-inner) {
	color: #a8a8a8 !important;
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
		height: 60px;
		margin-bottom: 10px;
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
