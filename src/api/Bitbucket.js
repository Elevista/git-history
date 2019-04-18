import Axios from 'axios'
import Commit from '../Commit'
import _ from 'lodash'
import { basename } from 'path'
import Netlify from 'netlify-auth-providers'
import icon from '~/assets/Bitbucket-blue.svg'
import neutralIcon from '~/assets/bitbucket-neutral.svg'
const siteId = 'e118565a-2bcd-40be-b5ba-a76411cb721c'
const apiURL = 'https://api.bitbucket.org/2.0/repositories'

const rec = (path, value) => {
  if (value instanceof Array) return value.map(x => rec(path, x))
  if (value instanceof Object) return _.map(value, (v, k) => rec(`${path}.${k}`, v))
  return `${path}.${value}`.slice(1)
}
const fields = {
  values: {
    commit: [
      'date', 'message', 'hash',
      { author: [
        'raw',
        { user: ['display_name', 'links.avatar.href'] }
      ] }
    ]
  }
}
const fieldsPath = _.flattenDeep(rec('', fields))
const params = { fields: fieldsPath.join(',') }

async function authenticate () {
  const authenticator = new Netlify({ site_id: siteId })
  const { token } = await new Promise((resolve, reject) => authenticator.authenticate({ provider: 'bitbucket', scope: 'repo' }, (err, data) => err ? reject(err) : resolve(data)))
  return token
}

async function fetch (pathname, token) {
  try {
    const [, owner, repo, , sha, ...rest] = pathname.split('/')
    const axios = Axios.create({
      baseURL: `${apiURL}/${owner}/${repo}`,
      ...token && { headers: { common: { Authorization: `Bearer ${token}` } } }
    })
    const path = rest.join('/')
    const { data: { values: commits } } = await axios.get(`/filehistory/${sha}/${path}`, { params })
    return Promise.all(commits.map(async commit => {
      const [date, message, sha, rawName, name = rawName, avatar = neutralIcon] = _.map(fieldsPath, x => _.get({ values: commit }, x))
      const rest = {
        url: `https://bitbucket.org/${owner}/${repo}/src/${sha}/${path}`,
        fileName: basename(path),
        code: await axios.get(`/src/${sha}/${path}`, { transformResponse: x => x }).then(x => x.data)
      }
      return new Commit({ sha, author: { name, avatar }, date, message, ...rest })
    }))
  } catch (e) {
    if (_.get(e, 'response.status') === 401) throw Object.assign(e, { tokenExpired: true })
    throw new Error(_.get(e, 'response.data.error.message', `~/api/Bitbucket Error`))
  }
}

export default {
  hostname: 'bitbucket.org',
  icon,
  authenticate,
  async getCommits ({ pathname }, token) {
    return { commits: await fetch(pathname, token) }
  }
}
