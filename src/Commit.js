
export default class Commit {
  constructor ({ sha, author: { name, avatar }, date, message, code, url, fileName }) {
    Object.assign(this, { sha, author: { name, avatar }, date, message, code, url, fileName })
  }
}
