<template>
  <div class="git-history" tabindex="0"
       @keydown.left.prevent="prev" @keydown.right.prevent="next"
       @touchstart="touchstart" @touchend="touchend">
    <div class="header" @wheel.stop="wheel">
      <form class="form flex flex-1 justify-center align-center" @submit.prevent="load">
        <a class="icon shrink-0" :style="api&&{backgroundImage:`url(${api.icon})`}"
           :href="api&&urlStr" target="_blank " />
        <div class="url">
          <input v-model="urlStr" type="url" @paste="paste" @keydown.stop>
          <span class="hidden">{{ urlStr }}</span>
        </div>
        <label class="private flex shrink-0"><input v-model="signin" type="checkbox" :disabled="!api"><span>Auth</span></label>
      </form>
      <div class="commits">
        <div class="commits-scroll" :style="{transform:`translateX(${commitsScroll}%)`}">
          <button v-for="(commit,idx) of commits" :key="commit.sha" class="commit"
                  :class="{active:index===idx}" @click="index=idx">
            <div class="flex overflow-hidden align-center max-inherit">
              <div class="avatar" :style="{backgroundImage:`url(${commit.author.avatar})`}" />
              <div class="flex-column flex-1 overflow-hidden">
                <div class="name">{{ commit.author.name }}</div>
                <div class="date">{{ commit.date|date }}</div>
              </div>
            </div>
            <transition name="message">
              <a v-if="index===idx" class="message" :href="commit.url" target="_blank">{{ commit.message.split('\n')[0] }}</a>
            </transition>
          </button>
          <button v-if="even" class="commit" />
        </div>
      </div>
    </div>
    <Diff v-if="commits.length" :commits="commits" :index="index" class="content"
          @wheel.native.stop="wheel($event,true)" />
    <a href="https://github.com/Elevista/git-history" target="_blank" class="github"><img src="~/assets/GitHub-Mark.png"></a>
  </div>
</template>
<script>
import * as api from './api'
import Diff from './Diff.vue'
import moment from 'moment'
import url from 'url'
import _ from 'lodash'

const defaultUrl = 'https://github.com/babel/babel/blob/master/packages/babel-core/test/browserify.js'

export default {
  name: 'GitHistory',
  components: { Diff },
  filters: { date (v) { return moment(v).format('YYYY-MM-DD HH:mm:ss') } },
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
    even () { return !(this.length % 2) },
    token: {
      get () { return this.api && this.tokens[this.api.hostname] },
      set (v) { this.$set(this.tokens, this.api.hostname, v) && this.load() }
    },
    signin: {
      get () { return !!this.token },
      async set (v) { this.token = v ? await this.api.authenticate() : undefined }
    },
    commitsScroll () {
      const diff = Math.ceil((this.length - 1) / 2) - this.index
      return (100 / (this.length + this.even)) * -diff
    }
  },
  watch: { tokens: { handler (v) { sessionStorage.tokens = JSON.stringify(v) }, deep: true } },
  mounted () {
    this.$el.focus()
    this.load()
  },
  methods: {
    paste () { setTimeout(() => { this.load() }, 0) },
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
  .header{
    background-color: #fafbfc;
    padding-bottom: 0;
    border-bottom: 1px solid #e1e4e8;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    .form{
      height: 1.5rem; font-size: .7rem; position: relative;
      *{box-sizing: border-box;transition: all .3s linear}
      .icon{background-repeat: no-repeat;background-size: contain;height: 1rem;width:1rem;}
      border: 1px solid #e1e4e8;
      .url{
        position: relative; white-space: nowrap;max-width: 100%;overflow: hidden;margin:0 .3rem;height:100%;
        input{width:100%;height:100%;outline: none;border: none;background: none;text-align: center;position: absolute;}
      }
    }
    .commits{
      display:flex;
      justify-content: center;
      .commits-scroll{transition: transform .6s ease-out;display: flex;flex-direction: row-reverse;}
      .commit{
        padding:0;border:none;outline:none;background: none;text-align: left;
        width:12rem;
        max-width:12rem;
        display:flex;
        flex-direction: column;
        opacity: .5;
        align-items: center;
        &.active{opacity: 1;}
        transition: opacity .6s;
        .avatar{
          flex-shrink: 0;
          width: 2rem;
          height: 2rem;
          margin: 0.7rem;
          background-size: contain;
          border: solid 1px lightgray;
          border-radius: 0.125rem;
          background-color: white;
        }
        .date{font-size: .8rem;color:lightgray}
        .name{overflow:hidden;text-overflow: ellipsis;white-space: nowrap;}
        .message{
          font-size: 0.75rem;
          color: #595959;
          max-width: 30rem;
          @media (max-width: 30rem) { max-width: 100vw; }
          overflow: hidden;
          white-space: pre;
          text-overflow: ellipsis;
          line-height: 2rem;
          height: 2rem;
          text-decoration: none;
          z-index: 1;
          transition: all .6s cubic-bezier(0.680, -0.550, 0.265, 1.550);
          &-enter,&-leave-to{opacity: 0;}
          &-enter-to,&-leave{opacity: 1;}
        }
      }
    }
  }
  .content{flex:1}
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
.hidden{visibility: hidden;}
.shrink-0{flex-shrink: 0}
</style>
