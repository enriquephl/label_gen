import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const apiIP="127.0.0.1";
const apiAddr=`http://${apiIP}:5003/v3`;


export default new Vuex.Store({
  state: {
    feature: {},
    label: {},
    tsne_feature: {},
    tsne_label: {},
    mask: [],
    graphFilter: [],
    overview: {},
    helper: {
      apiAddr: apiAddr,
      guid() {
        return  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
    },
    dataset: "",
    labelStat: {}
  },
  mutations: {
    addToTable(state, payload){
      // table: df, field: headers, value: value
      state[payload.table] = payload.value;
    },
    pushToTable(state, payload){
      state[payload.table].push(payload.value);
    },
    deleteArrayItemById(state, payload){
      state[payload.table] = state[payload.table].filter(x => x.id !== payload.id);
    }
  },
  actions: {
    importBuiltIn(context, payload){
      const reqFeature=axios.get(`${apiAddr}/builtin/load`,{params: {dataset: payload.dataset, filename: "feature"}});
      const reqLabel=axios.get(`${apiAddr}/builtin/load`,{params: {dataset: payload.dataset, filename: "label"}});
      const reqOverviewAttr=axios.get(`${apiAddr}/builtin/load/overview`,{params: {dataset: payload.dataset, filename: "attribute"}});
      const reqOverviewLabel=axios.get(`${apiAddr}/builtin/load/overview`,{params: {dataset: payload.dataset, filename: "labels"}});
      return axios.all([reqFeature,reqLabel,reqOverviewAttr,reqOverviewLabel])
      .then(axios.spread((...res) => {
        context.commit("addToTable",{table: "dataset", value: payload.dataset});
        context.commit("addToTable",{table: "feature", value: res[0].data });
        context.commit("addToTable",{table: "label", value: res[1].data });
        context.commit("addToTable",{table: "overview", value: {attribute: res[2].data, labels: res[3].data}});
        return {success: true};
      }))
    },
    importTsne(context, payload){
      const reqTsneFeature=axios.get(`${apiAddr}/builtin/load`,{params: {dataset: payload.dataset, filename: "tsne_feature"}});
      const reqTsneLabel=axios.get(`${apiAddr}/builtin/load`,{params: {dataset: payload.dataset, filename: "tsne_label"}});
      return axios.all([reqTsneFeature,reqTsneLabel])
      .then(axios.spread((...res) => {
        context.commit("addToTable",{table: "tsne_feature", value: res[0].data });
        context.commit("addToTable",{table: "tsne_label", value: res[1].data });
        return {success: true};
      }))
    },
    importStatLabel(context, payload){
      const reqTsneFeature=axios.get(`${apiAddr}/builtin/load`,{params: {dataset: payload.dataset, filename: "tsne_feature"}});
      const reqTsneLabel=axios.get(`${apiAddr}/builtin/load`,{params: {dataset: payload.dataset, filename: "tsne_label"}});
      return axios.all([reqTsneFeature,reqTsneLabel])
      .then(axios.spread((...res) => {
        context.commit("addToTable",{table: "tsne_feature", value: res[0].data });
        context.commit("addToTable",{table: "tsne_label", value: res[1].data });
        return {success: true};
      }))
    },
    addGraphFilter(context, payload){
      context.commit("pushToTable",{table: "graphFilter", value: payload.value});
    },
    removeGraphFilter(context, payload){
      context.commit("deleteArrayItemById",{table: "graphFilter", id: payload.id});
    },
    resetAll(context, payload){
      context.commit("addToTable",{table: "dataset", value: ""});
      context.commit("addToTable",{table: "feature", value: {}});
      context.commit("addToTable",{table: "label", value: {}});
      context.commit("addToTable",{table: "overview", value: {}});
      context.commit("addToTable",{table: "tsne_feature", value: [] });
      context.commit("addToTable",{table: "tsne_label", value: [] });
    },
    importUploadFilter(context, payload){
      context.commit("addToTable", {table:"graphFilter", value: payload.value});
      return {success: true};
    }
  },
  modules: {
  }
})
