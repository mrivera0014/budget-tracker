let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = event => {
    const db = event.target.result;

    db.createObjectStore('pending', { autoIncrement: true })
}

request.onsuccess = (event) => {
    // console.log("resultbase successful?")
    db = event.target.result

    if (navigator.onLine) {
        checkresultbase()
    }
}

request.onerror = (event) => {
    console.log(event.target.errorCode)
}

const saveRecord = (record) => {
    const transaction = db.transaction(['pending'], 'readwrite')

    const store = transaction.objectStore('pending')

    store.add(record)
}

const checkresultbase = () => {
    const transaction = db.transaction(['pending'], 'readwrite')

    const store = transaction.objectStore('pending')

    const getAll = store.getAll()

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(['pending'], 'readwrite')

                    const store = transaction.objectStore('pending')

                    store.clear()
                })
        }
    }
}

addEventListener('online', checkresultbase)