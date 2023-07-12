import { createStore } from "vuex";

const store = createStore({
	state: {
		headInfo: "",
		activename: "",
		headTittle: "",
		code: "",
	},
	getters: {},
	mutations: {
		set_headInfo(state, data) {
			state.headInfo = data;
		},
		set_activename(state, data) {
			state.activename = data;
		},
		set_headTittle(state, data) {
			state.headTittle = data;
		},
	},
	actions: {},
	modules: {},
});

export default store;
