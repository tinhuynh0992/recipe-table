import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {}
});

const state = () => ({
  posts: [],
  numPages: 0,
  numPosts: 2960,
  loadingPosts: false,
  errorMsg: null,
  baseUrl: "https://blog.paleohacks.com/wp-json/wp/v2/posts?categories=8",
  perPage: "&per_page=10",
  wpFetchHeaders: {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "x-wp-total"
    }
  }
});

const getters = {
  loadingPosts: state => state.loadingPosts,
  posts: state => state.posts,
  numPosts: state => state.numPosts,
  errorMsg: state => state.errorMsg
};

const mutations = {
  SET_POSTS(state, posts) {
    state.posts = posts;
  },
  SET_LOADING_STATE(state, payload) {
    state.loadingPosts = payload;
  },
  SET_NUM_POSTS(state, payload) {
    state.numPosts = payload;
  },
  SET_ERROR(state, payload) {
    state.errorMsg = payload;
  }
};

const actions = {
  async getNumPages({ commit, state }) {
    commit("SET_LOADING_STATE", true);
    const { headers } = await axios.get(
      `${state.baseUrl}${state.perPage}`,
      state.wpFetchHeaders
    );

    const numPages = headers["x-wp-totalpages"];
    commit("SET_NUM_POSTS", numPages * 10);
    return numPages;
  },

  async fetchPosts({ commit, state }, numPages) {
    const posts = [];
    for (let page = 1; page <= numPages; page += 1) {
      const post = axios.get(
        `${state.baseUrl}${state.perPage}&page=${page}`,
        state.wpFetchHeaders
      );
      posts.push(post);
    }
    await axios
      .all(posts)
      .then(response => {
        const postData = response.map(res => res.data).flat();
        return postData;
      })
      .then(data => {
        const modifiedPosts = data.map(post => ({
          content: post.content,
          excerpt: post.excerpt,
          author: post.author,
          link: post.link,
          id: post.id,
          tags: post.tags,
          title: post.title.rendered,
          slug: post.slug,
          date: post.date
        }));
        commit("SET_POSTS", modifiedPosts);
        commit("SET_LOADING_STATE", false);
        return true;
      })
      .catch(e => {
        console.error('fetch error ==== ', e.response)
        commit("SET_ERROR", e)
      });
    return false
  }
};

export const store = new Vuex.Store({
  state,
  actions,
  getters,
  mutations
});
