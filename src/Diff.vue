<template>
  <div v-if="commits.length" class="diff">
    <transition-group :name="transition" tag="code" appear @enter="setOffset">
      <span v-for="line of lines" :key="line.key" class="line"
            :style="line.seq===seq&&{transitionDelay:line.delay+'ms'}"
            v-html="line.html" />
    </transition-group>
  </div>
</template>
<script>
import { diffLines } from 'diff'
import Prism from './Prism'
export default {
  props: {
    commits: { type: Array, required: true },
    index: { type: Number, required: true }
  },
  data () { return { key: 0, seq: 0, lines: [], transition: 'line-prev' } },
  computed: {
    commit () { return this.commits[this.index] || {} },
    code () { return this.commit.code }
  },
  watch: {
    index (n, o) { this.transition = n < o ? 'line-next' : 'line-prev' },
    code: {
      async handler (n = '', o = '') {
        const lang = await Prism.loadDep(Prism.detectLang(this.commit.fileName))
        this.seq++
        let [idx, addIdx] = [0, 0]
        const diffs = diffLines(o, n)
        const htmlLines = Prism.highlight(n, lang).split('\n')
        const add = html => ({ key: this.key++, html, delay: addIdx++ * 10, seq: this.seq })
        diffs.forEach(({ count, value, added, removed }) => {
          if (removed) return this.lines.splice(idx, count)
          if (added) this.lines.splice(idx, 0, ...htmlLines.slice(idx, idx + count).map(add))
          idx += count
        })
      },
      immediate: true
    }
  },
  methods: { setOffset (el) { el.style.top = `${el.offsetTop}px` } }
}
</script>
<style lang="scss" scoped>
.diff{
  overflow-x: hidden;
  overflow-y: scroll;
  height:100%;
  justify-content: center;
  padding: 1rem;
  code{
    font-family: inherit;
    margin:0 auto;
    max-width: 800px;
    display: block;
    position: relative;
    .line{
      white-space: pre-wrap;
      font-size: .85rem;
      height: 1.3em;
      line-height: 1.3em;
      width:100%;
      display: inline-block;
      transition: all .6s cubic-bezier(0.680, -0.550, 0.265, 1.550);
      &-next-enter,&-prev-leave-to{ transform: translateX(100%); opacity: 0; }
      &-next-leave-to,&-prev-enter{ transform: translateX(-100%); opacity: 0;  }
      &-next-leave-active,&-prev-leave-active{
        position: absolute; transition-delay: 0s !important; left:0;
        transition-timing-function: cubic-bezier(0.890, -0.005, 0.385, 1.060);
      }
    }
  }
}
</style>
