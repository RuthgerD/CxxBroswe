const requestify = require('requestify');
const jwt = require('jwt-simple');
const jwtTokenValidity = process.env.JWT_VALIDITY || 2629746000; // 1 month

// Auth handler
let providers = {
    github: {
        clientId: process.env.GITHUB_CLIENT_ID || 'c2ff54cacaccb53954dd',
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://dev.cxxbroswe.xyz:8080/auth/callback', // Your client app URL
        service: {
            tokenRequestUrl: 'https://github.com/login/oauth/access_token',
            userDetailsRequestUrl: 'https://api.github.com/user'
        }
    }
}

exports.loginGithub = async (req, res, next) => {
    const provider = providers.github
    const request = req.body
    // Check if the client has actually sent credentials in the request
    if (request.clientId === provider.clientId) {
        const clientCode = request.code

        // Send credentials from client to Github, and request a temporary oauth token
        const oauthRequestBody = { 'client_id': provider.clientId, 'client_secret': provider.clientSecret, 'code': clientCode };
        const oauthRequestHeaders = { 'accept': 'application/json' };
        const oathTokenReponse = await requestify.request(provider.service.tokenRequestUrl, { method: 'POST', body: oauthRequestBody, headers: oauthRequestHeaders })
        const r = JSON.parse(oathTokenReponse.body)
        const userAccessToken = r.access_token
        const tokenType = r.token_type
        const userDetailsRequestHeaders = { 'Authorization': tokenType + ' ' + userAccessToken }

        // Use temporary token to request user details from Github
        const userDetailsRequest = await requestify.request(provider.service.userDetailsRequestUrl, { method: 'GET', headers: userDetailsRequestHeaders })
        const user = JSON.parse(userDetailsRequest.body)
        const username = user.login
        const userId = user.id
        console.log('User ' + username + ' w/ ID: ' + userId + ' logged in using ' + 'github')

        if (userId && username) {
            // Login has succeeded, generate JWT token and return it to the client
            const jwtPayload = {
                id: user.id,
                username: user.login,
                created: Date.now(),
                expires: Date.now() + jwtTokenValidity,
                source: 'Github',
                role: 'user'
            }
            const token = jwt.encode(jwtPayload, process.env.JWT_SECRET)

            // return token
            res.status(200).json({ 'access_token': token })
        } else {
            // If we now do not have a user from Github, we assume that the login has failed
            res.status(401).json({ 'message': 'Unauthorised' })
        }
    } else {
        res.status(401).json({ 'message': 'Unauthorised' })
    }
}

exports.verifyToken = async (req, res, next) => {
    let validToken = false;
    const token = req.body.token
    if (token) {
        validToken = this.isTokenValid(token)
    }
    validToken ? res.status(200).json({ 'message': 'Valid token' }) : res.status(401).json({ 'message': 'Unauthorised' })
}

//TODO: implement token validity checking
exports.isTokenValid = function (jwtToken) {
    try {
        payload = jwt.decode(jwtToken, process.env.JWT_SECRET);
    } catch (err) {
        // Token is not valid, probably has the wrong secret, not issued by us
        return false
    }
    if (payload.expires < Date.now()) {
        // Token has expired
        return false
    } else {
        //TODO: when we record user in DB, we can verify token
        // For now, we assume that this is a valid token
        return true
    }
}