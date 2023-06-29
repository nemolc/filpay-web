<template>
	<div v-show="!isshow" v-loading="loading" class="minheight">
		<div class="card" v-for="(item, i) in proposals" :class="item.stat == -1 ? 'bgUnderway' : item.stat == 1 ? 'bgSuccess' : item.stat == 2 ? 'bgError' : ''" :key="i" @click="openInfo(item, i)">
			<div class="item">
				<img src="@/assets/icon1.png" v-if="item.proposal_type == 5" alt="" />
				<img src="@/assets/icon2.png" v-if="item.proposal_type == 4" alt="" />
				<img src="@/assets/icon3.png" v-if="item.proposal_type == 2" alt="" />
				<img src="@/assets/icon4.png" v-if="item.proposal_type == 3" alt="" />
				<img src="@/assets/icon5.png" v-if="item.proposal_type == 1" alt="" />
				<div>
					<div class="name">{{ proposalName(item) }}</div>
				</div>
			</div>
			<div class="btn" :class="item.stat == -1 ? 'underway' : item.stat == 0 ? 'primary' : item.stat == 1 ? 'success' : 'error'">{{ proposalStatus(item) }}</div>
		</div>
	</div>
	<div class="container" v-show="isshow">
		<div class="formInfo">
			<div class="title">{{ proposalName(details) }}</div>
			<div class="btn" :class="details.stat == -1 ? 'underway' : details.stat == 0 ? 'primary' : details.stat == 1 ? 'success' : 'error'">
				{{ proposalStatus(details) }}
			</div>
			<div class="item" v-if="details.proposal_type == 1">
				<div>新Beneficiary地址</div>
				<span>{{ details.details.new_addr }}</span>
			</div>
			<div class="item" v-if="details.proposal_type == 2">
				<div>新收益起始释放高度</div>
				<span>{{ details.details.new_beneficiary_release_height }}</span>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<span>{{ getDate1 }}</span>
			</div>
			<div class="item" v-if="details.proposal_type == 3">
				<div>新质押起始释放高度</div>
				<span>{{ details.details.new_invested_release_height }}</span>
			</div>
			<div v-if="details.proposal_type == 4">
				<div class="item" v-for="(item, i) in details.details.new_allot_ratios" :key="i">
					<div>收益人{{ i + 1 }}</div>
					<div>{{ item.addr }}</div>
					<span>{{ ((item.ratio / 10000) * 100).toFixed(2) }}%</span>
				</div>
			</div>
			<div class="item" v-if="details.proposal_type == 5">
				<div>更新质押池</div>
				<span>{{ convert_fil(details.details.new_invested_funds) }} </span>
			</div>
		</div>
		<div class="vote" v-if="details.stat == 0">
			<div class="title">请投票</div>
			<div class="content">
				<div class="voteBtn" v-for="(item, i) in list" :key="i" @click="choose(i)" :class="{ select: active == i }">
					<el-icon v-if="active == i"> <check /> </el-icon>{{ item }}
				</div>
			</div>
			<div class="bottom">
				<div class="voteBtn primary" @click="submit">投票</div>
			</div>
		</div>

		<div class="voteResult">
			<div>投票结果</div>
			<ul>
				<li v-for="(item, i) in details.vote_stat" :key="i">
					{{ item.addr }}<span>{{ item.stat == 0 ? "未投票" : item.stat == 1 ? "同意" : "反对" }}</span>
				</li>
			</ul>
		</div>
		<signature :dialogName="'投票'" :parentForm="form" v-model:show="visible"></signature>
	</div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { get } from "@/utils/request";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { convert_fil } from "@/utils/tool";
import signature from "@/components/signature.vue";
import { getTimestamp, getHeight } from "@/utils/date";
const store = useStore();
const Route = useRoute();
const isshow = ref(false);
const visible = ref(false);
const loading = ref(false);
const getDate1 = ref("");
const getDate = ref("");
const form = reactive({
	approved: false,
	activeIndex: 0,
});
const active = ref(null);
const proposals = ref([]);
const details = ref("");
const list = reactive(["同意", "反对"]);
const choose = (i) => {
	active.value = i;
	form.approved = i == 0 ? true : false;
};
const proposalName = (item) => {
	return item.proposal_type == 1
		? "変更Beneficiary地址"
		: item.proposal_type == 2
		? "变更产出收益释放高度"
		: item.proposal_type == 3
		? "变更质押退还释放高度"
		: item.proposal_type == 4
		? "变更收益人比例"
		: "更新质押池总额";
};
const proposalStatus = (item) => {
	return item.stat == -1 ? "未通过" : item.stat == 0 ? "进行中" : item.stat == 1 ? "通过" : "执行失败";
};
const submit = async () => {
	if (active.value == null) {
		ElMessage.warning("请投票");
	} else {
		visible.value = true;
	}
};
onMounted(() => {
	proposalsFun();
});
const proposalsFun = async () => {
	loading.value = true;
	try {
		const res = await get(`${sessionStorage.getItem("network")}/${Route.query.id}/proposals`);
		proposals.value = res.data;
		for (const obj of proposals.value) {
			for (const item of obj.vote_stat) {
				if (item.stat === 2) {
					obj.stat = -1;
					break;
				}
			}
		}

		// 指定排序顺序
		const sortOrder = [0, 1, -1];

		// 自定义比较函数
		function customSort(a, b) {
			const indexA = sortOrder.indexOf(a.stat);
			const indexB = sortOrder.indexOf(b.stat);

			return indexA - indexB;
		}

		// 按照指定顺序进行排序
		proposals.value.sort(customSort);

		loading.value = false;
	} catch (error) {
		if (error == 404) {
			ElMessage.warning("暂无提案");
		}
		loading.value = false;
	}
};
const openInfo = (item, i) => {
	form.activeIndex = i;
	details.value = item;
	isshow.value = true;
	const { start_at, block_delay_secs } = store.state.headInfo;
	if (item.proposal_type == 2) {
		getDate1.value = getTimestamp(start_at, block_delay_secs, item.details.new_beneficiary_release_height);
	} else if (item.proposal_type == 3) {
		getDate1.value = getTimestamp(start_at, block_delay_secs, item.details.new_invested_release_height);
	}
};
</script>
<style lang="less" scoped>
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
</style>
