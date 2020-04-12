/*
  Object for AJAX calls in nodejs
  example usage:

  const gql = { query: '{userList {uuid\nemail\n}}' }
  const opts = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(gql),
  }
  ajax.fetch('http://localhost:5000/graphql', opts).then(res => {
    const { response, xhr } = res
    console.log(response, xhr.statusCode)
  })

*/

const https = require('https');
const http = require('http');
const url = require('url');

const ajax = {
  fetch: (fullurl, opts) => {
    return new Promise((resolve, reject) => {
      const urlObject = url.parse(fullurl)
      const allOptions = Object.assign(opts, {
        hostname: urlObject.hostname,
        path: urlObject.path,
        port: urlObject.port,
      })

      const request = fullurl.toUpperCase().indexOf('HTTPS') === 0 ? https.request : http.request

      const req = request(allOptions, xhr => {
        let response = ''
        xhr.setEncoding('utf8')
        xhr.on('data', chunk => (response += chunk))
        xhr.on('end', () => {
          resolve({ response, xhr })
        })
      })

      req.on('error', err => reject({ response: null, err }))
      req.write(opts.body)
      req.end()
    })
  },
}
