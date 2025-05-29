// IndexedDB CRUD operations

const dbName = "PersonalFinanceDB";
const storeName = "debts";

// Open or create the database
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log("Database opened successfully:", event.target.result);
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
                console.log("Object store created:", storeName);
            }
        };

        request.onsuccess = (event) => {
            console.log("Database opened successfully:", event.target.result);
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Add data to the store
async function addData(data) {
    const db = await openDatabase();
    console.log("Adding data to IndexedDB:", db);
    return new Promise((resolve, reject) => {
        console.log("Adding data:", db, storeName);
        var transaction = db.transaction(storeName, "readwrite");
        var store = transaction.objectStore(storeName);
        var request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Read data by key
async function getDataById(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Update data
async function updateData(id, updatedData) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put({ ...updatedData, id });

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Delete data
async function deleteData(id) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// // Example usage
// (async () => {
//     try {
//         const id = await addData({ name: "John Doe", age: 30 });
//         console.log("Added data with ID:", id);

//         const data = await getDataById(id);
//         console.log("Retrieved data:", data);

//         await updateData(id, { name: "Jane Doe", age: 25 });
//         console.log("Updated data");

//         await deleteData(id);
//         console.log("Deleted data");
//     } catch (error) {
//         console.error("Error:", error);
//     }
// })();
// Get all data from the store
async function getAlldebts() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

