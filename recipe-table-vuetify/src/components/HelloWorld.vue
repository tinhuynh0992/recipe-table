<template>
  <v-card>
    <v-card-title>
      Nutrition
      <v-spacer></v-spacer>
      <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
    </v-card-title>
    <v-data-table
      :loading="loadingPosts"
      :headers="headers"
      :items="posts"
      :search="search"
      :footer-props="footerProps"
      :expanded.sync="expanded"
      show-expand
    >
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <div v-html="item.content.rendered" class="ingredients">

          </div>
        </td>
      </template>

      
        

      <!-- Recipe Author -->
      <template v-slot:item.author="{ item }">
        <span v-text="recipeAuthor(item.author)" />
      </template>
      <!-- Recipe Tags -->
      <template v-slot:item.tags="{ item }">
        <div class="tags-container my-2">
          <a :href="tag.link" target="_blank" v-for="tag in recipeTags(item.tags)" :key="tag.id">
            <v-chip
              style="cursor: pointer;"
              class="my-1 mx-1 caption p-0"
              :ripple="false"
              v-text="tag.name"
            />
          </a>
        </div>
      </template>
      <!-- Recipe Post Date -->
      <template v-slot:item.date="{ item }">
        <span v-text="new Date(item.date).toLocaleDateString()" />
      </template>
      <!-- Recipe Link -->
      <template v-slot:item.link="{ item }">
        <a :href="item.link" target="_blank">
          View
          <v-icon size="12">mdi-open-in-new</v-icon>
        </a>
      </template>
      <!-- Recipe Ingredients -->
      <template v-slot:item.content="{ item }">
        Click to expand
        <!-- {{ getRecipeSchemaHTML(item.content) }} -->
        <!-- {{ item.excerpt.protected }} -->
        <!-- <div v-for="(node, index) in getRecipeSchemaHTML(item.content)" :key="index">
          <span class="my-2">{{ node }}</span>
        </div>-->
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { allTags } from "@/utils/allTags";
import { allUsers } from "@/utils/allUsers";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      footerProps: {
        "items-per-page-options": [25, 50, 100, 250, 500, 1000, 2000]
      },
      expanded: [],
      search: "",
      headers: [
        { text: "Recipe Name", value: "title" },
        { text: "Author", value: "author", width: "10%" },
        { text: "Tags", value: "tags", width: '40%', sortable: false },

        // TODO: Add these columns & make searchable
        // { text: "Prep Time", value: "" },
        // { text: "Cook Time", value: "" },
        // { text: "Serves", value: "" },

        { text: "Post Date", value: "date" },
        { text: "Post Link", value: "link" },
        { text: "Ingredients", value: "content" },
        { text: "", value: "data-table-expand" }
      ],
      content: [],
    };
  },
  computed: {
    ...mapGetters({
      posts: "posts",
      loadingPosts: "loadingPosts"
    }),
    recipeAuthor() {
      return author => {
        const recipeAuthor = allUsers.find(user => user.id === author);
        return recipeAuthor.name;
      };
    },
    recipeTags() {
      return tags => {
        let tagsList = [];
        tags.forEach(tag => {
          tagsList.push(allTags.find(t => t.id === tag));
        });
        return tagsList;
      };
    },
    getRecipeSchemaHTML() {
      return post => {
        const SCHEMA_ID = "schema_block";
        // const SCHEMA_CLASS = "schema_new-recipe";
        const PARSER = new DOMParser();
        const POST_AS_HTML = PARSER.parseFromString(post.rendered, "text/html");
        const SCHEMA_HTML = POST_AS_HTML.getElementById(SCHEMA_ID);
        const RECIPE_DETAILS = SCHEMA_HTML.querySelectorAll(
          ".recipe-details"
        );


        // console.log({ SCHEMA_HTML: SCHEMA_HTML, RECIPE_DETAILS: RECIPE_DETAILS.textContent });
        return RECIPE_DETAILS.textContent
      };
    }
  },

  methods: {
    // customFilter(items, search, filter) {
    // search = search.toString().toLowerCase();
    // console.log({ items, search, filter })
    // return items.filter(row => filter(row["ingredients"], search));
    // }
  },
  mounted() {
    this.$store.dispatch("getNumPages").then(numPages => {
      this.$store.dispatch("fetchPosts", numPages);
    });

    // console.log({allTags, allUsers})
  }
};
</script>
<style>
.tags-container {
  display: flex; 
  flex-wrap: wrap;
} 

.ingredients {
  padding-top: 3vh;
}
</style>