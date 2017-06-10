'use strict';

/**
 * this function is used to add additional customizations to the express application before the express server starts. The function is bound with the periodic singleton instance
 * 
 * @returns 
 */
function customExpressConfiguration() {
  return new Promise((resolve, reject) => {
    /**
     * this.app// is a reference to periodic's express instance
     * app.use((req,res,next)=>{
     * //custom middleware
     * next(); 
     * })
     */
    resolve(true);
  });
}

module.exports = {
  customExpressConfiguration,
};