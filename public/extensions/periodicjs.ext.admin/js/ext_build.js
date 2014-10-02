(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":2,"reduce":3}],2:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],3:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],4:[function(require,module,exports){
'use strict';

var request = require('superagent'),
	// letterpress = require('letterpressjs'),
	updatemedia = require('./updatemedia'),
	extModal,
	searchExtInput,
	searchExtButton,
	searchGithubResultsTable,
	searchGithubResultsTableBody,
	installedtable,
	installedtablebody,
	uploadButton,
	hideConsoleOutput,
	consoleOutput;



var hideConsoleOutputClick = function () {
	document.getElementById('ext-console').style.display = 'none';
};

var buildSearchExtResultTable = function (data) {
	var returnhtml = '',
		repoinfo;
	for (var x in data) {
		repoinfo = data[x];
		returnhtml += '<tr><td>' + repoinfo.name + '</td><td>' + repoinfo.description + '</br> <small><a target="_blank" href="' + repoinfo.html_url + '">' + repoinfo.html_url + '</a></small></td><td class="_pea-text-right">';
		returnhtml += '<a href="#view/' + repoinfo.full_name + '" class="view-ext _pea-button" data-gitname="' + repoinfo.full_name + '" data-exttitle="' + repoinfo.name + '" data-desc="' + repoinfo.description + '">install</a></td></tr>';
	}
	return returnhtml;
};

var searchExtFromGithub = function () {
	searchGithubResultsTableBody.innerHTML = '<tr><td class="_pea-text-center" colspan="3">searching github</td></tr>';

	request
		.get('https://api.github.com/search/repositories')
		.query({
			q: 'periodicjs.ext.' + document.getElementById('search-ext_input').value
		})
		.set('Accept', 'application/json')
		.end(function (error, res) {
			if (error) {
				window.ribbonNotification.showRibbon(error.message, 4000, 'error');
			}
			else if (!res.body.items) {
				window.ribbonNotification.showRibbon('could not search github', 4000, 'error');
			}
			else {
				searchGithubResultsTable.style.display = 'table';
				searchGithubResultsTableBody.innerHTML = buildSearchExtResultTable(res.body.items);
			}
		});
};

var searchInputKeypress = function (e) {
	if (e.which === 13 || e.keyCode === 13) {
		searchExtFromGithub();
	}
};
var searchTblClick = function (e) {
	var eTarget = e.target,
		fullreponame,
		repoversionlist;

	console.log('search table click');

	if (eTarget.getAttribute('class') && eTarget.getAttribute('class').match('view-ext')) {
		console.log('pop modal');
		extModal.querySelector('.title').innerHTML = eTarget.getAttribute('data-exttitle').replace('periodicjs.ext.', '');
		extModal.querySelector('.desc').innerHTML = eTarget.getAttribute('data-desc');
		repoversionlist = extModal.querySelector('.versions');
		repoversionlist.innerHTML = '<li>loading versions...</li>';
		fullreponame = eTarget.getAttribute('data-gitname');

		window.silkscreenModal.showSilkscreen('Install Extension', extModal, null, 14);

		request
			.get('https://api.github.com/repos/' + fullreponame + '/tags')
			.set('Accept', 'application/json')
			.end(function (error, res) {
				if (error) {
					window.ribbonNotification.showRibbon(error.message, 4000, 'error');
				}
				else {
					extModal.querySelector('.versions').innerHTML = '';
					repoversionlist.innerHTML = '<li><a class="install-ext-link" data-repo="' + fullreponame + '" data-version="latest">latest</a></li>';
					// console.log(res.body.length,res.body)
					if (res.body.length > 0) {
						for (var x in res.body) {
							repoversionlist.innerHTML += '<li><a class="install-ext-link" data-repo="' + fullreponame + '" data-version="' + res.body[x].name + '">' + res.body[x].name + '</a></li>';
						}
					}
				}
			});
	}
};


var getConsoleOutput = function (responsebody, fullrepo, extname, operation, options) {
	var t = setInterval(function () {
			getOutputFromFile(responsebody.data.repo, responsebody.data.time);
		}, 4000),
		otf,
		cnt = 0,
		lastres = '',
		getRequest,
		repo = responsebody.data.repo,
		time = responsebody.data.time;
	if (options && options.getRequest) {
		getRequest = options.getRequest;
		fullrepo = options.repo;
		repo = options.repo;
		time = options.time;
	}
	else {
		getRequest = (operation === 'remove') ? '/p-admin/extension/remove/log/' + repo + '/' + time : '/p-admin/extension/install/log/' + repo + '/' + time;
	}
	consoleOutput.innerHTML = '';

	var cleanupLogFile = function (repo, time, mode, options) {
		var makenice = (options) ? true : false;
		request
			.get('/p-admin/extension/cleanup/log/' + repo + '/' + time)
			.query({
				format: 'json',
				mode: mode,
				makenice: makenice
			})
			.set('Accept', ' application/json')
			.end(function (error, res) {
				if (res.error) {
					error = res.error;
				}

				if (error) {
					window.ribbonNotification.showRibbon(error.message || res.text, 8000, 'error');
				}
			});
	};
	var getOutputFromFile = function (repo, time) {
		request
			.get(getRequest)
			.set('Accept', ' text/plain')
			.end(function (error, res) {
				try {
					if (res.error) {
						error = res.error;
					}
				}
				catch (e) {
					console.log(e);
				}

				if (error) {
					window.ribbonNotification.showRibbon(error.message || res.text, 8000, 'error');
					// console.log('error in ajax for file log data');
					console.log('cnt', cnt);
					console.log('res', res);
					if (res.error || cnt > 5) {
						clearTimeout(t);
					}
				}
				else {
					if (cnt > 20) {
						console.log('made 20 req stop ajax');
						clearTimeout(t);
					}
					// console.log(cnt);
					// console.log(res.text);
					if (res.text !== lastres) {
						otf = document.createElement('pre');
						otf.innerHTML = res.text;
						consoleOutput.appendChild(otf);
						consoleOutput.scrollTop = consoleOutput.scrollHeight;
					}
					if (res.text.match('====!!ERROR!!====') || res.text.match('====##END##====')) {
						if (res.text.match('====##END##====')) {
							window.ribbonNotification.showRibbon(fullrepo + ' installed', 8000, 'success');
							if (!installedtable.innerHTML.match(fullrepo)) {
								var installedExt = document.createElement('tr');
								installedExt.innerHTML = '<td><a href="/p-admin/extension/view/' + fullrepo + '">' + fullrepo + '</a><div><small>Refresh page for updated UI</small</div></td>' + '<td></td>' + '<td></td>';
								installedtablebody.appendChild(installedExt);
							}
							else {
								console.log('already installed', repo, time);
							}
							cleanupLogFile(repo, time, 'install', options);
						}
						clearTimeout(t);
					}
					else if (res.text.match('====!!ERROR!!====') || res.text.match('====##REMOVED-END##====')) {

						window.ribbonNotification.showRibbon(fullrepo + ' removed', 4000, 'warn');
						var removeExtElement = document.getElementById('tr-ext-' + extname);
						removeExtElement.parentNode.removeChild(removeExtElement);
						cleanupLogFile(repo, time, 'remove');
						clearTimeout(t);
					}
					lastres = res.text;
					cnt++;
				}
			});
	}

};


var installedTableClick = function (e) {
	var eTarget = e.target;

	console.log('eTarget', eTarget);
	if (eTarget.getAttribute('class') && eTarget.getAttribute('class').match('enable-ext-button')) {
		request
			.get(eTarget.getAttribute('data-href'))
			.query({
				format: 'json'
			})
			.set('Accept', 'application/json')
			.end(function (error, res) {
				if (error) {
					window.ribbonNotification.showRibbon(error.message, 4000, 'error');
				}
				else if (res.body.result === 'success') {
					if (res.body.data.msg === 'extension disabled') {
						window.ribbonNotification.showRibbon(res.body.data.msg, 4000, 'warn');
						eTarget.innerHTML = 'enable';
						eTarget.setAttribute('data-href', '/p-admin/extension/' + res.body.data.ext + '/enable');
						eTarget.setAttribute('class', '_pea-button  enable-ext-button');
						//<a data-href="/p-admin/extension/<%= extension.name %>/enable" class="_pea-button enable-ext-button">enable</a>		
					}
					else {
						window.ribbonNotification.showRibbon(res.body.data.msg, 4000, 'success');
						eTarget.innerHTML = 'disable';
						eTarget.setAttribute('data-href', '/p-admin/extension/' + res.body.data.ext + '/disable');
						eTarget.setAttribute('class', '_pea-button _pea-color-warn enable-ext-button');
						//<a data-href='/p-admin/extension/<%= extension.name %>/disable' class='_pea-button _pea-color-warn enable-ext-button'>disable</a>				
					}
				}
				else {
					window.ribbonNotification.showRibbon(res.body.data.error, 4000, 'error');
				}
			});
	}
	else if (eTarget.getAttribute('class') && eTarget.getAttribute('class').match('delete-ext-button')) {
		request
			.post(eTarget.getAttribute('data-href'))
			.query({
				format: 'json',
				_csrf: eTarget.getAttribute('data-token')
			})
			.set('Accept', 'application/json')
			.end(function (error, res) {
				if (res && res.error) {
					error = res.error;
				}
				if (error) {
					window.ribbonNotification.showRibbon(error.message, 4000, 'error');
				}
				else {
					document.getElementById('ext-console').style.display = 'block';
					getConsoleOutput(res.body, eTarget.getAttribute('data-extname'), res.body.data.extname, 'remove');
				}
			});

	}
};

var uploadMediaFiles = function (e) {
	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files;

	// process all File objects
	for (var i = 0, f; f = files[i]; i++) {
		// ParseFile(f);
		// uploadFile(f);
		updatemedia.uploadFile(null, f, {
			posturl: '/p-admin/extension/upload?format=json',
			callback: function (doc) {
				// console.log(doc);
				var res = {
					body: {
						data: {
							time: doc.time,
							repo: doc.extname
						}
					}
				};
				document.getElementById('ext-console').style.display = 'block';
				getConsoleOutput(res.body, null, null, null, {
					getRequest: '/p-admin/extension/upload/log/' + doc.extname + '/' + doc.time,
					extname: doc.extname,
					repo: doc.extname,
					time: doc.time
				});
			}
		});
	}
};

var extmodalClick = function (e) {
	var eTarget = e.target;
	if (eTarget.getAttribute('class') === 'install-ext-link') {
		window.silkscreenModal.hideSilkscreen();

		request
			.get('/p-admin/extension/install')
			.query({
				name: eTarget.getAttribute('data-repo'),
				version: eTarget.getAttribute('data-version'),
				format: 'json'
			})
			.set('Accept', 'application/json')
			.end(function (error, res) {
				if (res && res.error) {
					error = res.error;
				}
				if (error) {
					window.ribbonNotification.showRibbon(error.message, 4000, 'error');
				}
				else {
					document.getElementById('ext-console').style.display = 'block';
					getConsoleOutput(res.body, eTarget.getAttribute('data-repo').split('/')[1]);
				}
			});
	}
};
window.addEventListener('load', function () {
	searchExtInput = document.getElementById('search-ext_input');
	searchExtButton = document.getElementById('search-ext_button');
	searchGithubResultsTable = document.getElementById('ext-search-results');
	searchGithubResultsTableBody = document.getElementById('ext-search-results-tbody');
	extModal = document.getElementById('view-ext-info-modal');
	consoleOutput = document.getElementById('ext-console-output');
	installedtablebody = document.getElementById('installed-ext-tablebody');
	installedtable = document.getElementById('installed-ext-table');
	hideConsoleOutput = document.getElementById('hide-ext-console');
	uploadButton = document.getElementById('upload-ext_button');
	searchExtInput.addEventListener('keypress', searchInputKeypress, false);
	searchExtButton.addEventListener('click', searchExtFromGithub, false);
	searchGithubResultsTable.addEventListener('click', searchTblClick, false);
	extModal.addEventListener('click', extmodalClick, false);
	installedtable.addEventListener('click', installedTableClick, false);
	hideConsoleOutput.addEventListener('click', hideConsoleOutputClick, false);
	uploadButton.addEventListener('change', uploadMediaFiles, false);
	window.checkPeriodicVersion();
});

},{"./updatemedia":5,"superagent":1}],5:[function(require,module,exports){
'use strict';

var updatemedia = function (element, mediadoc, additem) {
	var updateMediaResultHtml = function (element, mediadoc) {
		element.appendChild(generateMediaHtml(mediadoc));
	};

	var generateMediaHtml = function (mediadoc) {
		var mediaHtml = document.createElement('div'),
			htmlForInnerMedia = '';
		mediaHtml.setAttribute('class', '_pea-col-span4 media-item-x');
		mediaHtml.setAttribute('data-id', mediadoc._id);
		if (!additem) {
			htmlForInnerMedia += '<input style="display:none;" name="assets" type="checkbox" value="' + mediadoc._id + '" checked="checked"></input>';
		}
		if (mediadoc.assettype.match('image')) {
			htmlForInnerMedia += '<img class="_pea-col-span11" title="' + mediadoc.name + '" src="' + mediadoc.fileurl + '"/>';
		}
		else {
			htmlForInnerMedia += '<div class="_pea-col-span11"> ' + mediadoc.fileurl + '</div>';
		}
		htmlForInnerMedia += '<div class="mix-options _pea-text-right">';
		if (additem) {
			htmlForInnerMedia += '<a data-id="' + mediadoc._id + '"  title="' + mediadoc.name + '" class="_pea-button add-asset-item _pea-color-success">+</a>';
		}
		else {
			htmlForInnerMedia += '<a href="/p-admin/asset/' + mediadoc._id + '" target="_blank"  title="edit asset" class="_pea-button edit-asset _pea-color-info">i</a>';
			htmlForInnerMedia += '<a data-assetid="' + mediadoc._id + '" title="make primary asset" class="_pea-button make-primary _pea-color-warn">*</a>';
			htmlForInnerMedia += '<a data-assetid="' + mediadoc._id + '" title="remove asset" class="_pea-button remove-asset _pea-color-error">x</a>';
		}
		htmlForInnerMedia += '</div>';
		mediaHtml.innerHTML = htmlForInnerMedia;
		return mediaHtml;
	};

	updateMediaResultHtml(element, mediadoc);
};

updatemedia.handleMediaButtonClick = function (e) {
	var eTarget = e.target;
	if (eTarget.getAttribute('class') && eTarget.getAttribute('class').match('remove-asset')) {
		document.getElementById('media-files-result').removeChild(eTarget.parentElement.parentElement);
	}
	else if (eTarget.getAttribute('class') && eTarget.getAttribute('class').match('make-primary')) {
		document.getElementById('primaryasset-input').value = eTarget.getAttribute('data-assetid');
		var mpbuttons = document.querySelectorAll('._pea-button.make-primary');
		for (var x in mpbuttons) {
			if (typeof mpbuttons[x] === 'object') {
				mpbuttons[x].style.display = 'inline-block';
			}
		}
		eTarget.style.display = 'none';
	}
};

updatemedia.uploadFile = function (mediafilesresult, file, options) {
	var reader = new FileReader(),
		client = new XMLHttpRequest(),
		formData = new FormData(),
		posturl = (options && options.posturl) ? options.posturl : '/mediaasset/new?format=json',
		callback = (options && options.callback) ? options.callback : function (data) {
			updatemedia(mediafilesresult, data);
		};

	reader.onload = function () {
		// console.log(e);
		// console.log(file);
		formData.append('mediafile', file, file.name);

		client.open('post', posturl, true);
		client.setRequestHeader('x-csrf-token', document.querySelector('input[name=_csrf]').value);
		client.send(formData); /* Send to server */
	};
	reader.readAsDataURL(file);
	client.onreadystatechange = function () {
		if (client.readyState === 4) {
			try {
				var res = JSON.parse(client.response);
				if (res.result === 'error') {
					window.ribbonNotification.showRibbon(res.data.error, 4000, 'error');
				}
				else if (client.status !== 200) {
					window.ribbonNotification.showRibbon(client.status + ': ' + client.statusText, 4000, 'error');
				}
				else {
					window.ribbonNotification.showRibbon('saved', 4000, 'success');
					callback(res.data.doc);
				}
			}
			catch (e) {
				window.ribbonNotification.showRibbon(e.message, 4000, 'error');
				console.log(e);
			}
		}
	};
};

module.exports = updatemedia;

},{}]},{},[4]);
