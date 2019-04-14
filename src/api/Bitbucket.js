import Axios from 'axios'
import Commit from '../Commit'
import _ from 'lodash'
import { basename } from 'path'
import Netlify from 'netlify-auth-providers'
import icon from '~/assets/Bitbucket-blue.svg'
import neutralIcon from '~/assets/bitbucket-neutral.svg'
const siteId = 'e118565a-2bcd-40be-b5ba-a76411cb721c'
const baseURL = 'https://api.bitbucket.org'

const rec = (path, value) => {
  if (value instanceof Array) return value.map(x => rec(path, x))
  if (value instanceof Object) return _.map(value, (v, k) => rec(`${path}.${k}`, v))
  return `${path}.${value}`.slice(1)
}
const fields = {
  values: [
    {
      commit: [
        'date', 'message', 'hash',
        { 'author.user': ['display_name', 'links.avatar.href'] }
      ]
    }
  ]
}
const fieldsPath = _.flattenDeep(rec('', fields))
const params = { fields: fieldsPath.join(',') }

async function authenticate () {
  try {
    const authenticator = new Netlify({ site_id: siteId })
    const { token } = await new Promise((resolve, reject) => authenticator.authenticate({ provider: 'bitbucket', scope: 'repo' }, (err, data) => err ? reject(err) : resolve(data)))
    return token
  } catch (e) {
    console.log(e)
  }
}

async function fetch (pathname, token) {
  const axios = Axios.create({ baseURL, ...token && { headers: { common: { Authorization: `Bearer ${token}` } } } })
  const [, owner, repo, , sha, ...paths] = pathname.split('/')
  const path = paths.join('/')
  const { data: { values: commits } } = await axios.get(`/2.0/repositories/${owner}/${repo}/filehistory/${sha}/${path}`, { params })
  return Promise.all(commits.map(async commit => {
    const [date, message, sha, name, avatar = neutralIcon] = _.map(fieldsPath, x => _.get({ values: commit }, x))
    const pathname = `/${owner}/${repo}/src/${sha}/${path}`
    const rest = {
      url: `https://bitbucket.org${pathname}`,
      fileName: basename(path),
      code: await axios.get(`/2.0/repositories${pathname}`).then(x => x.data)
    }
    return new Commit({ sha, author: { name, avatar }, date, message, ...rest })
  }))
}

export default {
  hostname: 'bitbucket.org',
  icon,
  authenticate,
  async getCommits ({ pathname }, token) {
    return { commits: await fetch(pathname, token) }
  }
}
