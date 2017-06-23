'use strict';

/**
 * returns a string that's used in an express router that's always prefixed with a preceding '/'
 * 
 * @param {String} adminPath 
 * @returns {String} route used for express router, that's always prefixed with a "/"
 */
function _route_prefix(adminPath) {
  return (adminPath === '')
    ? '/'
    : (adminPath && adminPath.charAt(0) === '/')
      ? adminPath
      : '/' + adminPath;
}

/**
 * returns a route string without the precending '/' 
 * 
 * @param {String} adminPath 
 * @returns {String}
 */
function _admin_prefix(adminPath) {
  return _route_prefix(adminPath).substr(1);
}

/**
 * returns a route string that always has a preceding '/' and a suffixed '/', this is typically used for specifiying links to paths as absolute urls
 * 
 * @param {String} adminPath 
 * @returns {String}
 */
function _manifest_prefix(adminPath) {
  var admin_prefix = _admin_prefix(adminPath);
  return (admin_prefix.length > 0)
    ? '/'+admin_prefix+'/'
    : '/';
}

/**
 * short hand function to return all prefix types
 * 
 * @param {String} adminPath 
 * @returns {String}
 */
function all_prefixes(adminPath){
  return {
    route_prefix : _route_prefix(adminPath),
    admin_prefix : _admin_prefix(adminPath),
    manifest_prefix : _manifest_prefix(adminPath),
  };
}

function splitModelNameReducer(result, model_name) {
  let split = model_name.split('_');
  let parent = split.shift();
  let child = split.join('_');
  result[parent] = result[parent] || [];
  result[parent].push(child);
  return result;
}

function regexModelNameReducer(result, model_name) {
  let [parent, child, ] = model_name.replace(/^([^\s_]+)_{1}(.+)$/, '$1 $2').split(' ');
  result[parent] = result[parent] || [];
  result[parent].push(child);
  return result;
}


/**
 * Enforces the shape of an api response, by allow for three properties (result,status and data) all other properties are on data
 * 
 * @param {string} options.result result of request (usually sucess or error) 
 * @param {number} options.status http resonse code equivalent 
 * @param {object} options.data data for response
 * @returns {object} with the shape {result,status,data}
 */
function formatResponse(options) {
  const formattedOptions = Object.keys(options).reduce((result, key) => {
    if (key === 'result') {
      result[ key ] = options[ key ].toString();
    } else if (key === 'status') {
      result[ key ] = parseInt(options[ key ], 10);
    } else if(key==='data'){
      result.data = Object.assign({},result.data,options[ key ]);
    } else {
      result.data[ key ] = options[ key ];
    }
    return result;
  }, { data: {}, });
  return Object.assign({}, {
    result: 'success',
    status: 200,
    data:{},
  }, formattedOptions);
}

module.exports = {
  splitModelNameReducer,
  regexModelNameReducer,
  all_prefixes,
  route_prefix : _route_prefix,
  admin_prefix : _admin_prefix,
  manifest_prefix : _manifest_prefix,
};