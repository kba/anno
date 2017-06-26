const errors = require('@kba/anno-errors')
const expressJWT = require('express-jwt')
const {envyConf} = require('envyconf')

module.exports = function UserAuthMiddlewareFactory() {

    function UserAuthMiddleware(req, resp, next) {
        const {collectionConfig, collection} = req.annoOptions = req.annoOptions || {}
        if (!collectionConfig || !collection) {
            console.log(req.annoOptions)
            return next(errors.badRequest(
                "Missing 'collection'/'collectionConfig' in the request context"))
        }

        const {secret} = collectionConfig
        // Get Bearer token from Auth HTTP Header and verify with collection's secret
        expressJWT({
            secret,
            requestProperty: 'authToken'
        })(req, resp, (err) => {
            if (err && err.code !== 'credentials_required') {
                // XXX Note we don't pass any errors on so ACL can be handled by
                // anno-store / anno-acl
                console.log("JWT Error", err)
            }
            const {authToken} = req
            if (!authToken) {
                console.log(errors.badRequest(`Failed to parse/verify JWT`))
                return next()
            }

            if (!('iss' in authToken) || !('sub' in authToken)) {
                console.log("Obsolete token?", {authToken})
                return next(errors.badRequest(
                    `AuthToken must have 'sub' and 'iss' fields`, authToken))
            }
            if (collection !== authToken.iss) {
                return next(errors.mismatch(
                    "Inconsistent 'X-Anno-Collection' vs 'JWT.iss'", collection, authToken.iss))
            }
            req.annoOptions.user = authToken.sub

            console.log("JWT verified", authToken)
            next()
        })
    }
    UserAuthMiddleware.unless = require('express-unless')
    return UserAuthMiddleware
}
