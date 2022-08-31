class Stroage {
    get(key) {
        return JSON.parse(localStorage.getItem(key))
    }

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value))
    }

    has(key) {
        const value = localStorage.getItem(key)
        return value !== null && value !== 'undefined'
    }
}

const data = new Stroage()
