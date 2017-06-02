'use strict';

function installExtension(){
  return new Promise((resolve, reject)=>{
    try{
      console.log('installing extension');
      resolve(true);
    } catch(e){
      reject (e);
    }
  });
}

module.exports = {
  installExtension,
};