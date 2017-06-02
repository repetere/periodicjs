'use strict';

function uninstallExtension(){
  return new Promise((resolve, reject)=>{
    try{
      console.log('uninstalling extension');
      resolve(true);
    } catch(e){
      reject (e);
    }
  });
}

module.exports = {
  uninstallExtension,
};