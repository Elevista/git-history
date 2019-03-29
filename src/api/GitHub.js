import axios from 'axios'
import Commit from '../Commit'
import _ from 'lodash'
import { Base64 } from 'js-base64'
import URL from 'url'
const isPromise = v => typeof v.then === 'function'
function camelCase (o) {
  if (!(o instanceof Object)) return o
  if (isPromise(o)) return o.then(camelCase)
  if (_.isArrayLikeObject(o)) return _.map(o, camelCase)
  if (_.isPlainObject(o)) return _(o).mapKeys((v, k) => _.camelCase(k)).mapValues(camelCase).value()
  return o
}
const defaultAvatar = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
async function fetch (pathname) {
  try {
    const [, owner, repo, , sha, ...paths] = pathname.split('/')
    const path = `/${paths.join('/')}`
    const { data: commits } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${sha}&path=${path}`)
    await Promise.all(commits.map(async commit => {
      commit.contents = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents${path}?ref=${commit.sha}`).then(x => x.data)
    }))
    return camelCase(commits).map(commit => {
      const {
        sha, author,
        commit: { author: { name, date } = {}, message } = {},
        contents: { name: fileName, content, htmlUrl: url } = {}
      } = commit
      const { avatarUrl: avatar = defaultAvatar } = author || {} // author can be null
      return new Commit({ sha, author: { name, avatar }, date, message, code: Base64.decode(content), url, fileName })
    })
  } catch (e) {
    return Promise.reject(_.get(e, 'response.data.message') || '~/api/GitHub Error')
  }
}

export default async function (url) {
  const { pathname, hostname } = URL.parse(url)
  if (hostname !== 'github.com') return
  return { commits: await fetch(pathname) }
}
