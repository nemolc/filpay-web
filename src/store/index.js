import { createStore } from 'vuex'

const store = createStore({
  state: {
    headInfo:"",
    activename:""
  },
  getters: {

  },
  mutations: {
    set_headInfo(state,data) {
      state.headInfo = data;
    },
    set_activename(state,data) {
      state.activename = data;
    }
  },
  actions: {

  },
  modules: {

  }
})

export default store