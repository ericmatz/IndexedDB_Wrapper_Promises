/**
 * Opens a connection to an indexedDB database
 * @param {string} database_name Name of indexedDB to be opened
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
 * Adds record objects to the specificed objectStore
 * @param {IDBDatabase} database Initiliazed database
 * @param {string} storeName Name of objectStore where transactions will be occurring
 * @param {[object]} data Object to be inserted into the objectStore
 * @returns {Promise} Resolve => String | Reject => Error
 */
function addRecords(database, storeName, data) {
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

        data.forEach(record => {
            let request = objectStore.add(record);

            request.onsuccess = function () {
                console.log("Add Request Succesful");
            };

            request.onerror = function (event) {
                reject(`Error: addRecord - Request Failed: Supplied Data: {${database_name},${database_version},${upgrade_function}} Code: ${event.target.errorCode} Error: ${request.error} Record: ${record}`)
            };

        })

    });
}

/**
 * Deletes records on a given Index and key from the specified objectStore
 * @param {IDBDatabase} database Initialized database
 * @param {string} storeName Name of ObjectStore where transactions will be occurring
 * @param {string} indexName An Index from a provided ObjectStore
 * @param {any} key Key being looked for
 */
function deleteRecordsOnIndex(database, storeName, indexName, key) {
    return new Promise(function (resolve, reject) {

        console.log(`I'm trying to delete ${key} from the index ${indexName} in the objectstore ${storeName}`)

        let transaction = database.transaction(storeName, "readwrite");

        transaction.oncomplete = function () {
            console.log("Delete Transaction Successful.");
        };

        transaction.onabort = function (event) {
            reject(`Error: deleteRecords - Transaction Aborted - Supplied Data: {${database},${storeName},${indexName},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }

        transaction.onerror = function (event) {
            reject(`Error: deleteRecords - Transaction Failed - Supplied Data: {${database},${storeName},${indexName},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

        let objectStoreCursor = transaction.objectStore(storeName).index(indexName).openCursor();


        console.log(objectStoreCursor)

        objectStoreCursor.onsuccess = function (event) {
            console.log("cursor:", event)
            let cursor = event.target.result;
            if (cursor) {
                console.log(cursor.value[indexName])
                if (cursor.value[indexName] === key) {
                    let request = cursor.delete();
                    request.onsuccess = function () {
                        console.log('Record Deleted:', cursor.value);
                    }
                    request.onerror = function (event) {
                        reject(`Error: deleteRecords - Request Failed - Cursor: ${cursor} Supplied Data: {${database},${storeName},${indexName},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
                    }
                }
                cursor.continue();
            } else {
                reject(`Error: deleteRecords - Request Failed - Cursor: ${cursor} Supplied Data: {${database},${storeName},${indexName},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
            }
        }

        objectStoreCursor.onerror = function (event) {
            reject(`Error: deleteRecords - Cursor Failed - Supplied Data: {${database},${storeName},${indexName},${key} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }
    });
}

/**
 * Returns all records from the provided ObjectStore searching on the provided Index
 * @param {IDBDatabase} database Initialized database
 * @param {string} storeName Name of ObjectStore where transactions will be occurring
 * @param {string} indexName An Index from a provided ObjectStore
 * @param {IDBKeyRange | any} key Key being looked for
 * @returns {Promise} Resolve => Array of Objects | Reject => Reason
 */
function getRecordsOnIndex(database, storeName, indexName, key) {
    return new Promise(function (resolve, reject) {
        let transaction = database.transaction(storeName, "readonly");

        transaction.oncomplete = function () {
            console.log("Get Transaction Successful.");
        };

        transaction.onabort = function (event) {
            reject(`Error: getRecordsOnIndex - Transaction Aborted - Supplied Data: {${database},${storeName},${indexName},${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }

        transaction.onerror = function (event) {
            reject(`Error: getRecordsOnIndex - Transaction Failed - Supplied Data: {${database},${storeName},${indexName},${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

        let request = transaction.objectStore(storeName).index(indexName).getAll(key);

        request.onsuccess = function (event) {
            console.log("Get All Request Succesful");
            resolve(event.target.result)
        };

        request.onerror = function (event) {
            reject(`Error: getRecordsOnIndex - Request Failed - Supplied Data: {${database},${storeName},${indexName},${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

    });
}

/**
 * Returns all records from the provided ObjectStore
 * @param database Initialized database
 * @param storeName  Name of ObjectStore where transactions will be occurring
 * @returns {Promise} Resolve => Array of Object | Reject => Reason
 */
function getRecordsOnObjectStore(database, storeName) {
    return new Promise(function (resolve, reject) {

        let transaction = database.transaction(storeName, "readonly");

        transaction.oncomplete = function () {
            console.log("Get All Transaction Successful.");
        };

        transaction.onabort = function (event) {
            reject(`Error: getRecordsOnObjectStore - Transaction Aborted - Supplied Data: {${database},${storeName}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }

        transaction.onerror = function (event) {
            reject(`Error: getRecordsOnObjectStore - Transaction Failed - Supplied Data: {${database},${storeName}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

        let request = transaction.objectStore(storeName).getAll();

        request.onsuccess = function (event) {
            console.log("Get All Request Succesful");
            resolve(event.target.result)
        };

        request.onerror = function (event) {
            reject(`Error: getRecordsOnObjectStore - Request Failed - Supplied Data: {${database},${storeName}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

    })
}

/**
 * Returns all records from the provided ObjectStore searching on the provided keypath value
 * @param {IDBDatabase} database Initialized database
 * @param {string} storeName Name of ObjectStore where transactions will be occurring
 * @param {IDBKeyRange | any} key KeyPath value to search for
 * @returns {Promise} Resolve => Array of Objects | Reject => Reason
 */
function getRecordsOnKeyPath(database, storeName, key) {
    return new Promise(function (resolve, reject) {

        let transaction = database.transaction(storeName, "readonly");

        transaction.oncomplete = function () {
            console.log("Get Transaction Successful.");
        };

        transaction.onabort = function (event) {
            reject(`Error: getRecordsOnKeyPath - Transaction Aborted - Supplied Data: {${database},${storeName},${indexName},${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }

        transaction.onerror = function (event) {
            reject(`Error: getRecordsOnKeyPath - Transaction Failed - Supplied Data: {${database},${storeName},${indexName},${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

        let request = transaction.objectStore(storeName).getAll(key);

        request.onsuccess = function (event) {
            console.log("Get All Request Succesful");
            resolve(event.target.result)
        };

        request.onerror = function (event) {
            reject(`Error: getRecordsOnKeyPath - Request Failed - Supplied Data: {${database},${storeName},${indexName},${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };
    });
}

/**
 * Deletes records with a given keypath from the specified objectStore
 * @param {IDBDatabase} database Initialized database
 * @param {string} storeName Name of ObjectStore where transactions will be occurring
 * @param {string} indexName An Index from a provided ObjectStore
 * @param {IDBKeyRange | any} key KeyPath value to search for
 */
function deleteRecordsOnKeyPath(database, storeName, key) {
    return new Promise(function (resolve, reject) {

        let transaction = database.transaction(storeName, "readwrite");

        transaction.oncomplete = function () {
            console.log("Delete Transaction Successful.");
        };

        transaction.onabort = function (event) {
            reject(`Error: deleteRecordsOnKeyPath - Transaction Aborted - Supplied Data: {${database},${storeName}${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        }

        transaction.onerror = function (event) {
            reject(`Error: deleteRecordsOnKeyPath - Transaction Failed - Supplied Data: {${database},${storeName},${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };

        let request = transaction.objectStore(storeName).delete(key);

        request.onsuccess = function () {
            resolve("Delete Request(s) Succesful");
        };

        request.onerror = function (event) {
            reject(`Error: deleteRecordsOnKeyPath - Request Failed - Supplied Data: {${database},${storeName},${key}} Code: ${event.target.errorCode} Error: ${event.target.error}`)
        };
    });
}


export {
    openDB,
    addRecords,
    deleteRecordsOnIndex,
    deleteRecordsOnKeyPath,
    getRecordsOnIndex,
    getRecordsOnObjectStore,
    getRecordsOnKeyPath
}
