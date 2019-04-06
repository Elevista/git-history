import Axios from 'axios'
import Commit from '../Commit'
import _ from 'lodash'
import { Base64 } from 'js-base64'
import Netlify from 'netlify-auth-providers'
import icon from '~/assets/GitHub-Mark.png'
const siteId = 'e118565a-2bcd-40be-b5ba-a76411cb721c'
const isPromise = v => typeof v.then === 'function'
const baseURL = 'https://api.github.com'

function camelCase (o) {
  if (!(o instanceof Object)) return o
  if (isPromise(o)) return o.then(camelCase)
  if (_.isArrayLikeObject(o)) return _.map(o, camelCase)
  if (_.isPlainObject(o)) return _(o).mapKeys((v, k) => _.camelCase(k)).mapValues(camelCase).value()
  return o
}

async function authenticate () {
  try {
    const authenticator = new Netlify({ site_id: siteId })
    const { token } = await new Promise((resolve, reject) => authenticator.authenticate({ provider: 'github', scope: 'repo' }, (err, data) => err ? reject(err) : resolve(data)))
    return token
  } catch (e) {
    console.log(e)
  }
}

async function fetch (pathname, token) {
  try {
    const axios = Axios.create({ baseURL, ...token && { headers: { common: { Authorization: `bearer ${token}` } } } })
    const [, owner, repo, , sha, ...paths] = pathname.split('/')
    const path = `/${paths.join('/')}`
    const { data: commits } = await axios.get(`/repos/${owner}/${repo}/commits?sha=${sha}&path=${path}`)
    await Promise.all(commits.map(async commit => {
      commit.contents = await axios.get(`/repos/${owner}/${repo}/contents${path}?ref=${commit.sha}`).then(x => x.data)
    }))
    return camelCase(commits).map(commit => {
      const {
        sha, author,
        commit: { author: { name, date } = {}, message } = {},
        contents: { name: fileName, content, htmlUrl: url } = {}
      } = commit
      const { avatarUrl: avatar = icon } = author || {} // author can be null
      return new Commit({ sha, author: { name, avatar }, date, message, code: Base64.decode(content), url, fileName })
    })
  } catch (e) {
    if (_.get(e, 'response.status') === 401) return fetch(pathname, await authenticate()) // token no longer valid
    if (process.env.NODE_ENV !== 'production') console.error(e)
    return Promise.reject(_.get(e, 'response.data.message', '~/api/GitHub Error'))
  }
}

export default {
  hostname: 'github.com',
  icon,
  authenticate,
  async getCommits ({ pathname }, token) {
    return { commits: await fetch(pathname, token) }
  }
}
