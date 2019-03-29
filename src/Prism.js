import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import _ from 'lodash'

const dep = {
  'cpp': ['c'],
  'objectivec': ['c'],
  'handlebars': ['markup-templating']
}
const langExts = {
  'javascript': ['.js'],
  'jsx': ['.jsx'],
  'typescript': ['.ts'],
  'tsx': ['.tsx'],
  'json': ['.json', '.babelrc'],
  'yaml': ['.yaml', '.yml'],
  'bash': ['.sh'],
  'python': ['.py'],
  'dart': ['.dart'],
  'perl': ['.pl', '.pm'],
  'groovy': ['.groovy'],
  'sql': ['.sql', '.mysql'],
  'css': ['.css'],
  'less': ['.less'],
  'scss': ['.scss'],
  'ini': ['.ini', '.editorconfig'],
  'markup': ['.xml', '.html', '.htm', '.svg', '.mathml', '.vue'],
  'batch': ['.bat'],
  'clojure': ['.clj'],
  'coffeescript': ['.coffee'],
  'cpp': ['.cpp', '.cc'],
  'csharp': ['.cs'],
  'csp': ['.csp'],
  'diff': ['.diff'],
  'docker': ['dockerfile'],
  'fsharp': ['.fsharp'],
  'go': ['.go'],
  'handlebars': ['.hbs'],
  'haskell': ['.hs'],
  'java': ['.java'],
  'kotlin': ['.kt'],
  'lua': ['.lua'],
  'markdown': ['.md'],
  'objectivec': ['.objc'],
  'php': ['.php'],
  'powershell': ['.ps'],
  'pug': ['.pug'],
  'r': ['.r'],
  'reason': ['.re'],
  'ruby': ['.rb'],
  'rust': ['.rs'],
  'scala': ['.scala'],
  'scheme': ['.scheme'],
  'swift': ['.swift'],
  'visual-basic': ['.vb'],
  'wasm': ['.wasm']
}
const extLang = {}
_.forEach(langExts, (exts, lang) => exts.forEach(ext => { extLang[ext] = lang }))

async function loadDep (lang) {
  try {
    if (dep[lang]) await Promise.all(dep[lang].map(loadDep))
    if (!Prism.languages[lang]) await import(`prismjs/components/prism-${lang}`)
    return lang
  } catch (e) {
    console.error(e)
    return 'javascript'
  }
}
function detectLang (fileName) {
  const [ext] = fileName.match(/(\.[a-z]+|dockerfile)$/) || []
  return extLang[ext] || 'javascript'
}

export default {
  highlight (code, lang) {
    return Prism.highlight(code, Prism.languages[lang], lang)
  },
  loadDep,
  detectLang
}
