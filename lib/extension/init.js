'use strict';

function initExtension(){
  return new Promise((resolve, reject)=>{
    try{
      console.log('initializing extension');
      resolve(true);
    } catch(e){
      reject (e);
    }
  });
}

module.exports = {
  initExtension,
};