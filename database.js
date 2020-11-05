/**
 * Opens a connection to an IndexedDB database
 * @param {string} database_name Name of IndexedDB to be opened
 * @param {number} database_version Version of database to be opened
 * @param {function} upgrade_function Function to be executed if database needs to be upgraded
 * @returns {Promise} Resolve => IDBDatabase | Reject => Error
 */
function openDB(database_name, database_version, upgrade_function) {
    return new Promise(function (resolve, reject) {
        let request = indexedDB.open(database_name, database_version);

        request.onsuccess = function () {
            console.log("Database opened successfully")
            resolve(request.result);
        }

        request.onerror = function (event) {
            reject(`Error: openDB - Request Failed - Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
        };

        request.onupgradeneeded = function (event) {
            console.log('OnUpgradeNeeded - Called')
            upgrade_function(event.target.result)
                .then(console.log("Database Upgrade Successful"))
                .catch((reason) => {
                    reject(`Error: openDB - Database Upgrade Failed - Reason: ${reason}, Supplied Data {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
                })
        };
    });
}

/**
 * Adds a single object to the specificed objectStore
 * @param {IDBDatabase} database Initiliazed database
 * @param {string} storeName Name of objectStore where transactions will be occurring
 * @param {object} data Object to be inserted into the objectStore
 * @returns {Promise} Resolve => String | Reject => Error
 */
function addRecord(database, storeName, data) {
    return new Promise(function (resolve, reject) {
        let transaction = database.transaction(storeName, "readwrite");

        transaction.oncomplete = function () {
            console.log("Add Transaction Successful.");
            resolve("Add Transaction Succesful")
        };

        transaction.onabort = function (event) {
            reject(`Error: addRecord - Transaction Aborted - Supplied Data: {${database},${storeName},${data}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }

        transaction.onerror = function (event) {
            reject(`Error: addRecord - Transaction Failed - Supplied Data: {${database},${storeName},${data}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

        let objectStore = transaction.objectStore(storeName);

        let request = objectStore.add(data);

        request.onsuccess = function () {
            console.log("Add Request Succesful");
        };

        request.onerror = function (event) {
            console.log(`Error: addRecord - Request Failed: addRecord - Supplied Data: {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
            reject(`Error: addRecord - Request Failed: Supplied Data: {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error}`)
        };
    });
}

/**
 * Deletes records on a given index and key from the specified objectStore
 * @param {IDBDatabase} database Initialized database
 * @param {string} storeName Name of ObjectStore where transactions will be occurring
 * @param {IDBIndex} index An Index from a provided ObjectStore
 * @param {any} key Key being looked for
 */
function deleteRecords(database, storeName, index, key) {
    return new Promise(function (resolve, reject) {
        let transaction = database.transaction("records", "readwrite");

        transaction.oncomplete = function () {
            console.log("Delete Transaction Successful.");
            resolve("Records Deletion Successful")
        };

        transaction.onabort = function (event) {
            reject(`Error: deleteRecords - Transaction Aborted - Supplied Data: {${database},${storeName},${index},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }

        transaction.onerror = function (event) {
            reject(`Error: deleteRecords - Transaction Failed - Supplied Data: {${database},${storeName},${index},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

        let objectStore = transaction.objectStore(storeName);

        let objectStoreIndex = objectStore.index(index);

        let objectStoreCursor = objectStoreIndex.openCursor();

        objectStoreCursor.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                if (cursor.value[index] === key) {
                    let request = cursor.delete();
                    request.onsuccess = function () {
                        console.log('Record Deleted:', cursor.value);
                    }
                    request.onerror = function (event) {
                        reject(`Error: deleteRecords - Request Failed - Cursor: ${cursor} Supplied Data: {${database},${storeName},${index},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
                    }
                }
                cursor.continue();
            }
            console.log("Delete Request(s) Successful")
        }

        objectStoreCursor.onerror = function (event) {
            resolve(`Error: deleteRecords - Cursor Failed - Supplied Data: {${database},${storeName},${index},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }
    });
}

/**
 * Returns all records from the provided ObjectStore searching on the provided Index
 * @param {IDBDatabase} database Initialized database
 * @param {string} storeName Name of ObjectStore where transactions will be occurring
 * @param {string} index An Index from a provided ObjectStore
 * @param {IDBKeyRange | any} key Key being looked for
 * @returns {Promise} Resolve => Array of Objects | Reject => Reason
 */
function getRecordsOnIndex(database, storeName, index, key) {
    return new Promise(function (resolve, reject) {
        let transaction = database.transaction(storeName, "readonly");

        transaction.oncomplete = function () {
            console.log("Get Transaction Successful.");
        };

        transaction.onabort = function (event) {
            reject(`Error: getRecordsOnIndex - Transaction Aborted - Supplied Data: {${database},${storeName},${index},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }

        transaction.onerror = function (event) {
            reject(`Error: getRecordsOnIndex - Transaction Failed - Supplied Data: {${database},${storeName},${index},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

        let objectStore = transaction.objectStore(storeName);

        let objectStoreIndex = objectStore.index(index);

        let request = objectStoreIndex.getAll(key);

        request.onsuccess = function (event) {
            console.log("Get All Request Succesful");
            resolve(event.target.result)
        };

        request.onerror = function (event) {
            reject(`Error: getRecordsOnIndex - Request Failed - Supplied Data: {${database},${storeName},${index},${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

    });
}

export {openDB, addRecord, deleteRecords, getRecordsOnIndex}
