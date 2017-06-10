'use strict';
const semver = require('semver');

function generateErrorResponse(error) {
  return {
    status: 'error',
    data: { error, },
  };
}

function isVersionUpToDate(inputVersion, latestVersion) {
  return semver.gte(inputVersion, latestVersion);
}

function checkStatus(response) {
  return new Promise((resolve, reject) => {
    if (response.status >= 200 && response.status < 300) {
      resolve(response);
    } else {
      let error = new Error(response.statusText);
      error.response = response;
      try{
      // console.debug({response})
        response.json()
          .then(res => {
            reject(generateErrorFromResponse({ res, error }));
          })
          .catch(()=>{
            reject(error);
          })
      } catch(e){
        reject(error);
      }
    }
  });
};

function generateErrorFromResponse(options) {
  const { res, error } = options;
  if (res.data) {
    if (res.data.error) {
      return (res.data.error);
    } else{
      return (JSON.stringify(res.data));
    }
  } else {
    return(error);
  } 
}

module.exports = {
  isVersionUpToDate,
  generateErrorFromResponse,
  generateErrorResponse,
  checkStatus,
};