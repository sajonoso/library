//###  Object for AJAX calls in nodejs
const https = require('https');
const http = require('http');
const url = require('url');

const ajax = {
  fetch: (fullurl, opts) => {
    return new Promise((resolve, reject) => {
      const urlObject = url.parse(fullurl)
      opts.headers = !opts.headers ? { 'content-type': 'application/json' } : opts.headers
      const allOptions = Object.assign(opts, {
        hostname: urlObject.hostname,
        path: urlObject.path,
        port: urlObject.port,
      })
      const request = fullurl.toUpperCase().indexOf('HTTPS') === 0 ? https.request : http.request
      const req = request(allOptions, xhr => {
         if (xhr.statusCode === 301 || xhr.statusCode === 302) {
          ajax.fetch(xhr.headers.location, opts)
            .then(res2 => resolve(res2))
            .catch(err2 => reject({response:null, err2}))
          return
        }
        let response = ''
        xhr.setEncoding('utf8')
        xhr.on('data', chunk => (response += chunk))
        xhr.on('end', () => resolve({ response, xhr }))
      })
      req.on('error', err => reject({ response: null, err }))
      if (opts.body) req.write(opts.body)
      req.end()
    })
  },
}
/*
// example usage:
const query = `{
  allPeople(last: 3) {
    people {
      name
      gender
    }
  }
}`
const gql = { query }
const opts = {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(gql),
}
ajax.fetch('https://swapi-graphql.netlify.com/.netlify/functions/index', opts).then(res => {
  const { response, xhr } = res
  console.log(JSON.stringify(JSON.parse(response), null, 2), xhr.statusCode)
})
*/
