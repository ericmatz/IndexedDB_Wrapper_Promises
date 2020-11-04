/**
 * [Async] Opens a connection to a database
 * @param {string} database_name Name of IndexedDB to be opened
 * @param {number} database_version Version of database to be opened
 * @param {function} upgrade_function Function to be executed if database needs to be upgraded
 * @returns {Promise} Resolve => IDBDatabase | Reject => Error
 */
async function openDB(database_name, database_version, upgrade_function) {
    return new Promise(function (resolve, reject) {
      let request = indexedDB.open(database_name, database_version);
  
      request.onsuccess = function () {
        console.log("Database opened successfully")
        resolve(request.result);
      }
  
      request.onerror = function (event) {
        console.log(`Failed to open database - Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
        reject(`Failed to open database - Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
      };
  
      request.onupgradeneeded = function (event) {
        console.log('OnUpgradeNeeded - Called')
        upgrade_function(event.target.result)
          .then(console.log("Database Upgrade Successful"))
          .catch((reason)=>{console.log(`Database Upgrade Failed, Reason: ${reason}`)})
      };
  
    });
  }

  export {openDB}
