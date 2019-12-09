module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    noInfo: true,
    proxy: {
      '^/ph-api': {
        target: 'https://blog.paleohacks.com/wp-json/wp/v2/posts?categories=8',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  }
}