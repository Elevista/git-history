import Axios from 'axios'
import Commit from '../Commit'
import _ from 'lodash'
import { Base64 } from 'js-base64'
import Netlify from 'netlify-auth-providers'
import icon from '~/assets/GitHub-Mark.png'
const siteId = 'e118565a-2bcd-40be-b5ba-a76411cb721c'
const baseURL = 'https://api.github.com'

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
    const path = paths.join('/')
    const { data: commits } = await axios.get(`/repos/${owner}/${repo}/commits?sha=${sha}&path=${path}`)
    return Promise.all(commits.map(async commit => {
      const { sha, author, commit: { author: { name, date } = {}, message } = {} } = commit
      const { avatar_url: avatar = icon } = author || {} // author can be null
      const { name: fileName, content, html_url: url } = await axios.get(`/repos/${owner}/${repo}/contents/${path}?ref=${commit.sha}`).then(x => x.data)
      const code = Base64.decode(content)
      return new Commit({ sha, author: { name, avatar }, date, message, code, url, fileName })
    }))
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
