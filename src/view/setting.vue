<template>
	<el-container>
		<el-aside width="200px">
			<div class="aside" v-if="activerouter != '/prompt'">
				<el-menu :default-active="activerouter" @select="handleOpen">
					<div v-if="activerouteType == 'register'">
						<el-menu-item index="/register">
							<el-icon>
								<document />
							</el-icon>
							<template #title>{{ store.state.headTittle }}</template>
						</el-menu-item>
					</div>
					<div v-else-if="activerouteType == 'registertwo'">
						<el-menu-item index="/registertwo">
							<el-icon>
								<document />
							</el-icon>
							<template #title>{{ store.state.headTittle }}</template>
						</el-menu-item>
					</div>
					<div v-else-if="activerouteType == 'documents'">
						<el-sub-menu index="1">
							<template #title>
								<el-icon>
									<document />
								</el-icon>
								<span>说明文档</span>
							</template>
							<el-menu-item-group>
								<el-menu-item index="/documents/FILPAY"><b :class="activerouter == '/documents/FILPAY' ? 'chooseColor' : ''"></b>关于FILPAY</el-menu-item>
								<!-- <el-menu-item index="/documents/questions"><b
                      :class="activerouter == '/documents/questions' ? 'chooseColor' : ''"></b>常见问题</el-menu-item> -->
							</el-menu-item-group>
						</el-sub-menu>
					</div>
					<div v-else>
						<el-menu-item index="/contractDetail">
							<img src="@/assets/znhy1.png" alt="" v-if="activerouter == '/contractDetail'" />
							<img src="@/assets/znhy.png" alt="" v-else />
							<template #title>合约详情</template>
						</el-menu-item>
						<el-sub-menu index="2">
							<template #title>
								<!-- <img src="@/assets/dqta1.png" alt="" v-if="activerouter=='/contractDetail'" />
                <img src="@/assets/dqta.png" alt="" v-else /> -->
								<img src="@/assets/dqta.png" alt="" />
								<span>合约变更</span>
							</template>
							<el-menu-item-group>
								<el-menu-item index="/initiateProposal"><b :class="activerouter == '/initiateProposal' ? 'chooseColor' : ''"></b>发起提案</el-menu-item>
								<el-menu-item index="/viewProposal"><b :class="activerouter == '/viewProposal' ? 'chooseColor' : ''"></b>查看提案</el-menu-item>
							</el-menu-item-group>
						</el-sub-menu>
						<el-menu-item index="/withdrawalCurrency">
							<img src="@/assets/fqta1.png" alt="" v-if="activerouter == '/withdrawalCurrency'" />
							<img src="@/assets/fqta.png" alt="" v-else />
							<template #title>节点提币</template>
						</el-menu-item>
					</div>
				</el-menu>
			</div>
		</el-aside>
		<el-container>
			<el-main>
				<div v-text="activename.name" style="font-size: 18px"></div>
				<router-view :key="datakey" style="margin-top: 26px"> </router-view>
			</el-main>
		</el-container>
	</el-container>
</template>
<script setup>
import { ref, computed, watch, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
const store = useStore();
const Route = useRoute();
const router = useRouter();
const datakey = ref(Date.now());
const activename = reactive({
	name: "",
});
const activerouter = ref(Route.path);
const activerouteType = ref(Route.meta.type);
console.log("activerouteType", activerouteType);

const handleOpen = (url) => {
	if (url == Route.path) {
		datakey.value = Date.now();
		store.commit("set_activename", Route.meta.title);
	}
	router.push({ path: url, query: { id: Route.query.id } });
};
activename.name = computed(() => {
	return store.state.activename;
});
watch(
	() => router.currentRoute.value,
	(newValue) => {
		activerouter.value = newValue.path;
		store.commit("set_activename", newValue.meta.title);
		activerouteType.value = newValue.meta.type;
	},
	{ immediate: true }
);
</script>
<style lang="less" scoped>
:deep(.el-menu) {
	border: 0;
}

:deep(.el-menu-item-group__title) {
	padding: 0;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
	height: 40px;
	font-size: 16px;
	margin-bottom: 20px;
}

// :deep(.el-menu-item-group .el-menu-item.is-active) {
//   background: transparent;
//   color: #0090ff;
// }

:deep(.el-menu-item.is-active) {
	background: #0090ff;
	color: #fff;
	border-radius: 3px;
}

.el-container {
	text-align: left;
	height: calc(100vh - 60px);
	overflow: auto;
	-webkit-overflow-scrolling: touch;
}

.el-header {
	padding: 0;
}

.chooseColor {
	background: #fff !important;
}

.aside {
	background: #fff;
	height: calc(100vh - 60px);
	width: 200px;
	padding: 40px 10px 10px;

	b {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #000;
		margin: 0 15px 0 -10px;
	}

	i {
		font-size: 22px;
		margin-right: 5px !important;
	}

	img {
		width: 18px;
		margin: 0 8px 0 4px;
	}
}
</style>
