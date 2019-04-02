export default {
  server: { host: '0.0.0.0' },
  css: [
    '~/assets/global.scss',
    'normalize.css'
  ],
  head: {
    title: 'Git History',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Noto+Sans' }
    ]
  },
  build: {
    babel: {
      presets ({ isServer }) {
        const targets = isServer ? { node: '10' } : { ie: '10' }
        return [
          [ require.resolve('@nuxt/babel-preset-app'), { targets } ]
        ]
      }
    },
    extend (config, { isDev, isClient, isServer }) {
      if (isDev && isClient) config.devtool = 'inline-source-map'
    }
  }
}
