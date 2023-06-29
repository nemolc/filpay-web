import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { resolve } from "path"; // 主要用于alias文件路径别名
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	server: {
		//主要是加上这段代码
		port: 3000,
		proxy: {
			"/api": {
				// target: "http://172.16.10.3:8080/api/v1/", //测试环境地址
				target: "https://www.filpay.info/api/", //实际请求地址
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
	base: "/",
	//打包配置
	build: {
		//指定输出路径
		outDir: "distfilpay",
		//生成静态资源的存放路径
		assetsDir: "assets",
		//启用/禁用 CSS 代码拆分
		cssCodeSplit: true,
		//构建后是否生成 source map 文件
		sourcemap: false,
		// 生产环境取消 console
		// minify: 'terser',
		// terserOptions: {
		//   compress: {
		//     drop_console: true,
		//     drop_debugger: true
		//   }
		// },
		// 会打包出 css js 等文件夹 目录显得清晰
		rollupOptions: {
			output: {
				chunkFileNames: "js/[name]-[hash].js",
				entryFileNames: "js/[name]-[hash].js",
				assetFileNames: "[ext]/[name]-[hash].[ext]",
			},
		},
	},
	// 别名
	resolve: {
		alias: {
			"@": resolve(__dirname, ".", "src"),
		},
	},
});
