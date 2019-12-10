import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import { allUsers } from "@/utils/allUsers";
import { allTags } from "@/utils/allTags";

Vue.use(Vuex);

const parseExtraData = function(htmlStr) {
  const extraData = {
    preTime: 'N/A',
    cookTime: 'N/A',
    serves: 'N/A',
    ingredient: ''
  }
  const parser = new DOMParser();
  const html = parser.parseFromString(htmlStr, "text/html");

  // Parse preparing time, cooking time and serves
  const schemaContainer = html.getElementById("schema_block");
  if (schemaContainer) {
    const preTimeContainer = schemaContainer.querySelector(".prep-times")
    if (preTimeContainer) {
      const preTimePropertyDiv = preTimeContainer.querySelector(".recipeProperties")
      if (preTimePropertyDiv) {
        const prepTimeCols = preTimePropertyDiv.querySelectorAll(".prep-time-col")
        // Get serve
        const serveDiv = prepTimeCols[prepTimeCols.length - 1]
        if (serveDiv) {
          const serveText = serveDiv.firstChild.textContent
          extraData.serves = serveText.replace("Serves:", "")
        }
        // Get prepare time
        const preTimeDiv = preTimePropertyDiv.querySelector('.prep-time')
        if (preTimeDiv && preTimeDiv.childElementCount > 2) {
          const preTimeText = preTimeDiv.children[1].textContent
          extraData.preTime = preTimeText.replace("Prep Time:", "")
        }
        // Get cooking time
        const cookTimeDiv = preTimePropertyDiv.querySelector('.cook-time')
        if (cookTimeDiv && cookTimeDiv.childElementCount > 2) {
          const cookTimeText = cookTimeDiv.children[1].textContent
          extraData.cookTime = cookTimeText.replace("Cook Time:", "")
        }
      }

    }

    // Parse ingredient
    const recipeDetailContainer = html.querySelector(".recipe-details")
    if (recipeDetailContainer) {
      const recipeDetailsContents = recipeDetailContainer.querySelectorAll(".recipe-details-content")
      if (recipeDetailsContents && recipeDetailsContents.length > 2) {
        const ingredientDiv = recipeDetailsContents[1]
        extraData.ingredient = ingredientDiv.innerHTML
      }
    }
  }
  return extraData
}

const getAuthorById = function(author) {
  const recipeAuthor = allUsers.find(user => user.id === author);
  return recipeAuthor.name;
}

const getTagById = function(id) {
  const recipeTag = allTags.find(tag => tag.id === id);
  return recipeTag;
}

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
      // "Access-Control-Allow-Origin": "*",
      // "Access-Control-Expose-Headers": "x-wp-total"
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
    // for (let page = numPages; page <= numPages; page += 1) {
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
        const modifiedPosts = data.map(post => {
          const extraData = parseExtraData(post.content.rendered)
          return {
            content: post.content,
            excerpt: post.excerpt,
            preTime: extraData ? extraData.preTime : 0,
            cookTime: extraData ? extraData.cookTime : 0,
            reserves: extraData ? extraData.serves : 0,
            ingredient: extraData ? extraData.ingredient : '',
            author: post.author,
            authorStr: getAuthorById(post.author),
            link: post.link,
            id: post.id,
            tagIds: post.tags,
            tags: post.tags.map(id => getTagById(id)),
            title: post.title.rendered,
            slug: post.slug,
            date: post.date,

            toString: function() {
              const recipeName = this.title
              const tags = this.tags.map(tag => tag.name).join(',')
              const author = this.authorStr
              const date = new Date(this.date).toLocaleDateString()
              const ingredient = this.ingredient
              return recipeName.toLowerCase() + " " +
                tags.toLowerCase() + " " +
                author.toLowerCase() + " " +
                date.toLowerCase() + " " +
                ingredient.toLowerCase()
            }
          }
        })
        commit("SET_POSTS", modifiedPosts);
        commit("SET_LOADING_STATE", false);
        return true;
      })
      .catch(e => {
        console.error('fetch error ==== ', e)
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
