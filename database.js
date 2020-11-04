/**
 * [Async] Opens a connection to an IndexedDB database
 * @param {string} database_name Name of IndexedDB to be opened
 * @param {number} database_version Version of database to be opened
 * @param {function} upgrade_function Function to be executed if database needs to be upgraded
 * @returns {Promise} Resolve => IDBDatabase | Reject => Error
 */
async function openDB(database_name, database_version, upgrade_function) {
    return new Promise(function (resolve, reject) {
        try {
            let request = indexedDB.open(database_name, database_version);

            request.onsuccess = function () {
                console.log("Database opened successfully")
                resolve(request.result);
            }

            request.onerror = function (event) {
                console.log(`Failed to open database - Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
                throw (`Request Failed - Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
            };

            request.onupgradeneeded = function (event) {
                console.log('OnUpgradeNeeded - Called')
                upgrade_function(event.target.result)
                    .then(console.log("Database Upgrade Successful"))
                    .catch((reason) => {
                        console.log(`Database Upgrade Failed, Reason: ${reason}, Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
                        throw (`Database Upgrade Failed - Reason: ${reason}, Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
                    })
            };
        } catch (error) {
            reject(`Error: openDB - ${error.message}`)
        }
    });
}

/**
 * Adds a single object to the specificed objectStore
 * @param {IDBDatabase} database Initiliazed database
 * @param {string} objectStore Name of objectStore where transactions will be occurring
 * @param {object} data Object to be inserted into the objectStore
 * @returns {Promise} Resolve => String | Reject => Error
 */
async function addRecord(database, storeName, data) {
    return new Promise(function (resolve, reject) {
        try {
            let transaction = database.transaction(storeName, "readwrite");

            transaction.oncomplete = function () {
                console.log("Add Transaction Successful.");
            };

            transaction.onabort = function (event) {
                throw (`Transaction Aborted - Supplied Data {${database},${storeName},${data}} Code: ${event.target.errorCode} Error: ${request.error}`)
            }

            transaction.onerror = function (event) {
                throw (`Transaction Failed - Supplied Data {${database},${storeName},${data}} Code: ${event.target.errorCode} Error: ${request.error}`)
            };

            let objectStore = transaction.objectStore(storeName);

            let request = objectStore.add(data);

            request.onsuccess = function () {
                console.log("Add Request Succesful");
                resolve()
            };

            request.onerror = function (event) {
                console.log(`Request Failed: addRecord - Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
                throw (`Request Failed: Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
            };

        } catch (error) {
            reject(`Error: addRecord - ${error.message}`)
        }
    });
}

export {openDB, addRecord}
