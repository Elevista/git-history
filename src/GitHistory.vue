<template>
  <div class="git-history" tabindex="0"
       @keydown.left.prevent="prev" @keydown.right.prevent="next"
       @touchstart="touchstart" @touchend="touchend">
    <div class="header" @wheel.stop="wheel">
      <div class="menu flex">
        <form class="flex flex-1" @submit.prevent="load">
          <input v-model="url" type="url" class="url flex-1" @paste="paste">
        </form>
      </div>
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
      touchX: 0,
      url: this.$route.query.url || 'https://github.com/babel/babel/blob/master/packages/babel-core/test/browserify.js'
    }
  },
  computed: {
    length () { return this.commits.length },
    even () { return !(this.length % 2) },
    commitsScroll () {
      const diff = Math.ceil((this.length - 1) / 2) - this.index
      return (100 / (this.length + this.even)) * -diff
    }
  },
  mounted () {
    this.$el.focus()
    this.load()
  },
  methods: {
    paste () { setTimeout(() => { this.load() }, 0) },
    touchstart (evt) {
      const { changedTouches: [{ clientX }] } = evt
      this.touchX = clientX
    },
    touchend (evt) {
      const { changedTouches: [{ clientX }] } = evt
      const diff = clientX - this.touchX
      if (diff > 60) this.prev()
      else if (diff < -60) this.next()
    },
    async load () {
      try {
        for (const fn of Object.values(api)) {
          const res = await fn(this.url)
          if (!res) continue
          this.commits = res.commits
          this.index = 0
          return
        }
        alert('no match api for url')
      } catch (e) {
        console.error(e)
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
    .menu{
      height: 1.4rem;
      font-size: .7rem;
      .url{outline: none;border: 1px solid #e1e4e8;border: none;background: none;text-align: center;}
      .load{background: white;border: solid 1px black; color:black;outline: none;}
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
</style>
