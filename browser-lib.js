// ### base64 conversion
const b64encode = window.btoa
const b64decode = window.atob
/* */


// ### Object for AJAX calls in the browser
const ajax = {
  init: function() {
    let request = window.XMLHttpRequest ? new XMLHttpRequest() : null
    if (!request && window.ActiveXObject) {
      xmlvers = ['MSXML2.XmlHttp.6.0', 'MSXML2.XmlHttp.5.0', 'Microsoft.XmlHttp']
      for (var i = 0; i < xmlvers.length; i++) {
        try {
          request = new ActiveXObject(xmlvers[i])
          break
        } catch (e) {}
      }
    }
    return request
  },
  fetch: function(url, opts, callback) {
    const async = opts.async === undefined ? true : opts.async
    const method = opts.method ? opts.method : 'GET'
    opts.headers = !opts.headers ? { 'content-type': 'application/json' } : opts.headers
    var xhr = ajax.init()
    xhr.open(method, url, async)
    for (var key in opts.headers) {
      xhr.setRequestHeader(key, opts.headers[key])
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) callback({ response: xhr.status == 200 ? xhr.response : null, xhr })
    }
    xhr.send(opts.body ? opts.body : null)
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
ajax.fetch('https://swapi-graphql.netlify.com/.netlify/functions/index', opts, function(res) {
  console.log(JSON.stringify(JSON.parse(res.response), null, 2), res.xhr)
})
*/
