<script setup>
import headers from '@/components/header.vue';
import { ref, provide, nextTick } from 'vue'
const isRouteActive = ref(true);
provide('reload', () => {
	isRouteActive.value = false;
	nextTick(() => {
		isRouteActive.value = true;
	})
})
</script>

<template>
	<headers />
	<router-view v-if="isRouteActive" />
</template>

<style lang="less" scoped>
:deep(.el-input__suffix-inner) {
	cursor: pointer;
	color: #000 !important;
}

:deep(.el-dialog__header) {
	border-bottom: 1px solid #D3D6D8;
	padding: 0 30px;
	height: 50px;
	margin: 0;
	line-height: 50px;
}

:deep(.el-dialog__headerbtn) {
	top: 0;
	font-size: 20px;
}

:deep(.el-dialog) {
	border-radius: 10px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
	color: #000;
}

:deep(.el-dialog__title) {
	font-size: 16px;
	font-weight: bold;
}
</style>
