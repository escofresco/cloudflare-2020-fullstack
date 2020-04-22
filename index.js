/**
* Get a random element in array
*/
function randElm(array) {
    if (array.length > 0) {
        return array[Math.floor(Math.random() * array.length)]
    }
}

/**
* Get a random key,value from a Map as an object
* @param {Map} map
*/
function randKV(map) {
    let randKey = randElm(Array.from(map.keys()))
    return { 'key': randKey, 'value': map.get(randKey) }
}

/**
* Classify a cloudflare variant url into a group based on the final
* item in route path.
* @param {String} variant
*/
function variantGroup(variant) {
    let urlParts = variant.split('/')
    return urlParts[urlParts.length - 1]
}

/**
* Classify each variant url into a group and then return that as a map
* where groups are keys and urls are values
* @param {Object} variantArray
*/
function asVariantMap(variantArray) {
    let variantMap = new Map()
    variantArray.forEach(variantUrl => {
        variantMap.set(variantGroup(variantUrl), variantUrl)
    })
    return variantMap
}

/**
* Respond with random variant response
* @param {Request} request
*/
async function handleRequest(request) {

    const VARIANTS_URL = 'https://cfw-takehome.developers.workers.dev/api/variants'
    const COOKIE_NAME = 'Variant'
    const cookie = request.headers.get('cookie')

    // Map the variant group to its url
    let variantMap = await fetch(VARIANTS_URL)
        .then(response => response.json())
        .then(json => asVariantMap(json['variants']))
    let variantKeys = Array.from(variantMap)
    let response

    variantMap.forEach(async (variantUrl, variantGroup, _) => {
        //~~> Go through the variantMap by key and see if a cookie for one of
        // the items exists
        if (cookie && cookie.includes(`${COOKIE_NAME}=${variantGroup}`))
            // We found a cookie for one of the variant urls
            response = fetch(variantUrl)
    })

    if (response === undefined) {
        //~~> Cookie for a variant must not exist, so make a new Response
        // from a randomly picked variant
        let randVariantKV = randKV(variantMap)
        let randVariantGroup = randVariantKV.key
        let randVariantUrl = randVariantKV.value
        response = await fetch(randVariantUrl)
            .then(response => new Response(response.body))
        response.headers.append('Set-Cookie', `${COOKIE_NAME}=${randVariantGroup}`)
        return response
    } else {
        return await response
    }
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
