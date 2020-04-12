/*
  Object for AJAX calls in the browser
  example usage:

  const gql = { query: '{userList {uuid\nemail\n}}', }
  const opts = {
    method: 'POST',
    headers: { 'content-type': 'text/plain'},
    body: JSON.stringify(gql),
  }
  ajax.fetch('http://localhost:5000/graphql', opts, function(response, xhr) {
    console.log(response, xhr)
  })
*/

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
    var x = ajax.init()
    x.open(method, url, async)
    for (var key in opts.headers) {
      x.setRequestHeader(key, opts.headers[key])
    }
    x.onreadystatechange = function() {
      if (x.readyState == 4) callback(xhr.status == 200 ? x.response : null, x)
    }
    x.send(opts.body ? opts.body : null)
  },
}
