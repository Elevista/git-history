<template>
  <header class="header flex-column">
    <form class="form flex flex-1 justify-center align-center" @submit.prevent="load" @click="$refs.url.focus()">
      <a class="icon shrink-0" :style="api&&{backgroundImage:`url(${api.icon})`}"
         :href="api&&urlStr" target="_blank" @click.stop />
      <div class="url" @click.stop>
        <input ref="url" v-model="urlStr" type="url"
               @paste="paste" @keydown.stop>
        <span class="hidden">{{ urlStr }}</span>
      </div>
      <label class="private flex shrink-0" @click.stop>
        <input v-model="signin" type="checkbox" :disabled="!api"> Auth
      </label>
    </form>
    <div class="commits">
      <div class="commits-scroll" :style="{transform:`translateX(${commitsScroll}%)`}">
        <button v-for="(commit,idx) of commits" :key="commit.sha" class="commit"
                :class="{active:index===idx}" @click="$emit('update:index',idx)">
          <div class="inner">
            <div class="avatar" :style="{backgroundImage:`url(${commit.author.avatar})`}" />
            <div class="info">
              <div class="name">{{ commit.author.name }}</div>
              <div class="date">{{ commit.date|date }}</div>
            </div>
          </div>
          <transition name="message">
            <a v-if="index===idx" class="message" :href="commit.url" target="_blank"
               v-text="commit.message.split('\n')[0]" />
          </transition>
        </button>
        <button v-if="even" class="commit" />
      </div>
    </div>
  </header>
</template>
<script>
import moment from 'moment'

export default {
  filters: { date (v) { return moment(v).format('YYYY-MM-DD HH:mm:ss') } },
  model: { prop: 'value', event: 'input' },
  props: { commits: Array, index: Number, value: String, api: Object, token: String },
  computed: {
    length () { return this.commits.length },
    urlStr: {
      get () { return this.value },
      set (v) { this.$emit('input', v) }
    },
    signin: {
      get () { return !!this.token },
      async set (v) { this.$emit('update:token', v ? await this.api.authenticate() : undefined) }
    },
    even () { return !(this.length % 2) },
    commitsScroll () {
      const diff = Math.ceil((this.length - 1) / 2) - this.index
      return (100 / (this.length + this.even)) * -diff
    }
  },
  mounted () { this.load() },
  methods: {
    paste () { setTimeout(() => { this.load() }, 0) },
    load () { this.$emit('load') }
  }
}
</script>
<style lang="scss" scoped>
.header{
  background-color: #fafbfc;
  padding-bottom: 0;
  border-bottom: 1px solid #e1e4e8;
  overflow: hidden;
  .form{
    height: 1.5rem; font-size: .7rem; position: relative;
    *{box-sizing: border-box;transition: all .3s linear}
    .icon{background-repeat: no-repeat;background-size: contain;height: 1rem;width:1rem;}
    border: 1px solid #e1e4e8;
    .url{
      position: relative; white-space: nowrap;max-width: 100%;
      overflow: hidden;margin:0 .3rem;height:100%;min-width: 1rem;
      input{width:100%;height:100%;outline: none;border: none;background: none;text-align: center;position: absolute;}
    }
  }
  .commits{
    display:flex;justify-content:center;height:5.5rem;
    .commits-scroll{transition: transform .6s ease-out;display: flex;flex-direction: row-reverse;}
    .commit{
      padding:0;border:none;outline:none;background: none;text-align: left;
      width:12.5rem;display:flex;flex-direction: column;align-items: center;
      opacity: .5;
      &.active{opacity: 1;}
      transition: opacity .6s;
      .inner{display:flex;height:3.5rem;align-items: center;}
      .avatar{
        flex-shrink: 0;
        width: 2rem;
        height: 2rem;
        margin-right: 0.5rem;
        background-size: contain;
        border: solid 1px lightgray;
        border-radius: 0.125rem;
        background-color: white;
      }
      .info{max-width: 8.75rem;}
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
</style>
