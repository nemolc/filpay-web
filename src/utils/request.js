// 创建axios实例
import axios from "axios";
const service = axios.create({
	baseURL: "/api/v1",
	// baseURL: window.location.origin+'/api/v1/',
});
service.interceptors.request.use(
	(config) => {
		return config;
	},
	(err) => {
		return Promise.reject(err);
	}
);
/*全局响应拦截*/
service.interceptors.response.use(
	(response) => {
		return response;
	},
	(err) => {
		return Promise.reject(err);
	}
);
function checkstatus(response) {
	return new Promise((resolve, reject) => {
		if (response.data.code == 0) {
			resolve(response.data);
		} else {
			reject(response.data);
		}
	});
}
export const post = (url, params) => {
	return service({
		method: "post",
		url,
		data: params,
	}).then((response) => {
		return checkstatus(response);
	});
};
export const get = (url, params) => {
	return service({
		method: "get",
		url,
		params,
	}).then((response) => {
		return checkstatus(response);
	});
};
