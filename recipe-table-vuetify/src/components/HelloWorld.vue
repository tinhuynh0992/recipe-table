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
      :custom-filter="customFilter"
      show-expand
    >
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <div v-html="item.ingredient" class="ingredient-row">
          </div>
        </td>
      </template>

      <!-- Recipe Author -->
      <template v-slot:item.author="{ item }">
        <span v-text="item.authorStr" />
      </template>
      <!-- Recipe Tags -->
      <template v-slot:item.tags="{ item }">
        <div class="tags-container my-2">
          <a :href="tag.link" target="_blank" v-for="tag in item.tags" :key="tag.id">
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
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
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
        { text: "Prep Time", value: "preTime" },
        { text: "Cook Time", value: "cookTime" },
        { text: "Serves", value: "reserves" },

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
    })
  },

  methods: {
    customFilter(value, search, item) {
      search = search.toString().toLowerCase();
      return item.toString().includes(search)
    }
  },
  mounted() {
    this.$store.dispatch("getNumPages").then(numPages => {
      this.$store.dispatch("fetchPosts", numPages);
    });
  }
};
</script>
<style lang="scss">
.tags-container {
  display: flex; 
  flex-wrap: wrap;
} 

.ingredient-row {
  padding: 20px;

  &>h4 {
    font-size: 23px;
    font-weight: 400;
    margin: 10px 0;
    display: block;
  }

  .schema_strong {
    font-size: 19px;
    font-weight: 700;
  }

  .schema_checkbox_list {
    margin-left: 0;

    .big-checkbox {
      padding: 11px;
      border-radius: 4px;
      margin-right: 10px;
    }

    .regular-checkbox {
      background-color: #fafafa;
      border: 1px solid #cacece;
      box-shadow: inset 0 -15px 10px -12px rgba(0,0,0,.05);
      padding: 9px;
      border-radius: 3px;
      display: inline-block;
      position: relative;
    }

    input.regular-checkbox {
      opacity: 0;
      position: absolute;
    }

  }

  ul {
    list-style: none;
  }

  li {
    margin-bottom: 5px;
    list-style-type: none;

    span {
      position: relative;
      display: inline;
      top: -5px;
    }
  }
}
</style>
