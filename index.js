/**
* Get a random element in array
* @param {object} array
*/
function randElm(array) {
    if (array.length > 0) {
        return array[Math.floor(Math.random() * array.length)]
    }
}

/**
* Respond with random variance response
* @param {Request} request
*/
async function handleRequest(request) {
    const variantsUrl = 'https://cfw-takehome.developers.workers.dev/api/variants'

    // Store a random variant from variantsUrl response
    const randVariant = await fetch(variantsUrl)
        .then(response => response.json())
        .then(json => json['variants'])
        .then(variants => randElm(variants))

    // Give back variant response
    return fetch(randVariant)
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
