<template>
  <div class="git-history" tabindex="0"
       @keydown.left.prevent="prev" @keydown.right.prevent="next"
       @touchstart="touchstart" @touchend="touchend">
    <Header v-model="urlStr" :commits="commits" :index.sync="index" :api="api"
            :token.sync="token" @wheel.native.stop="wheel" @load="load" />
    <Diff v-if="commits.length" :commits="commits" :index="index" class="content"
          @wheel.native.stop="wheel($event,true)" />
    <a href="https://github.com/Elevista/git-history" target="_blank" class="github"><img src="~/assets/GitHub-Mark.png"></a>
  </div>
</template>
<script>
import * as api from './api'
import Header from './Header.vue'
import Diff from './Diff.vue'
import url from 'url'
import _ from 'lodash'

const defaultUrl = 'https://github.com/babel/babel/blob/master/packages/babel-core/test/browserify.js'

export default {
  name: 'GitHistory',
  components: { Header, Diff },
  head () {
    return this.length ? { title: `Git History - ${this.commits[this.index].fileName}` } : {}
  },
  data () {
    return {
      commits: [],
      index: 0,
      tokens: JSON.parse((process.client && sessionStorage.tokens) || '{}'),
      apiHost: _.keyBy(api, x => x.hostname),
      touch: { x: 0 },
      urlStr: this.$route.query.url || defaultUrl
    }
  },
  computed: {
    length () { return this.commits.length },
    url () { return url.parse(this.urlStr) },
    api () { return this.apiHost[this.url.hostname] },
    token: {
      get () { return this.api && this.tokens[this.api.hostname] },
      set (v) { this.$set(this.tokens, this.api.hostname, v) && this.load() }
    }
  },
  watch: { tokens: { handler (v) { sessionStorage.tokens = JSON.stringify(v) }, deep: true } },
  mounted () {
    this.$el.focus()
    this.load()
  },
  methods: {
    touchstart (evt) {
      const { changedTouches: [{ clientX: x }] } = evt
      this.touch.x = x
    },
    touchend (evt) {
      const { changedTouches: [{ clientX: x }] } = evt
      const diff = x - this.touch.x
      if (diff > 60) this.prev()
      else if (diff < -60) this.next()
    },
    async load () {
      if (!this.api) return
      try {
        const res = await this.api.getCommits(this.url, this.token)
        if (!res) return
        this.commits = res.commits
        this.index = 0
      } catch (e) {
        alert(e)
      }
    },
    next () { if (this.index > 0) this.index-- },
    prev () { if (this.index + 1 < this.commits.length) this.index++ },
    wheel (evt, checkShift = false) {
      const { shiftKey = false, deltaY } = evt
      if (checkShift && !shiftKey) return
      deltaY > 0 ? this.next() : this.prev()
      evt.preventDefault()
    }
  }
}
</script>
<style lang="scss" scoped>
.git-history{
  display: flex;
  flex-direction: column;
  outline-style:none;
  box-shadow:none;
  border-color:transparent;
  .github{
    display: block;position: absolute;
    width: 2.5rem; height: 2.5rem;
    right: 1.5rem; bottom: 1.5rem;
    opacity: .2;
    transition: opacity linear .4s;
    &:hover{opacity: .8;}
    img{width:100%}
  }
}
</style>
<style lang="scss">
.hidden{visibility: hidden;}
.shrink-0{flex-shrink: 0}
.flex{display: flex;}
.flex-row{display: flex;flex-direction: row;}
.flex-column{display: flex;flex-direction: column;}
.align-center{align-items: center;}
.justify-center{justify-content: center;}
.flex-1{flex:1}
.overflow-hidden{overflow: hidden;}
.max-inherit{max-width: inherit;max-height: inherit;}
</style>
