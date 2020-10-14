import requestify from 'requestify';
import jwt from 'jwt-simple';
import User from '../models/User.mjs';
import UserService from '../services/user.mjs';

const jwtTokenValidity = process.env.JWT_VALIDITY || 2629746000; // 1 month

const getProviders = () => ({
    github: {
        clientId: process.env.GITHUB_CLIENT_ID || 'c2ff54cacaccb53954dd',
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://dev.cxxbroswe.xyz:8080/auth/callback', // Your client app URL
        service: {
            tokenRequestUrl: 'https://github.com/login/oauth/access_token',
            userDetailsRequestUrl: 'https://api.github.com/user'
        }
    }
})

export const loginGithub = async (req, res, next) => {

    const provider = getProviders().github
    const request = req.body
    // Check if the client has actually sent credentials in the request
    if (request.clientId === provider.clientId) {

        // Send credentials from client to Github, and request a temporary oauth token
        const clientCode = request.code
        const oauthRequestBody = { 'client_id': provider.clientId, 'client_secret': provider.clientSecret, 'code': clientCode };
        const oauthRequestHeaders = { 'accept': 'application/json' };
        const oathTokenReponse = await requestify.request(provider.service.tokenRequestUrl, { method: 'POST', body: oauthRequestBody, headers: oauthRequestHeaders })
        const r = JSON.parse(oathTokenReponse.body)
        const userAccessToken = r.access_token
        const tokenType = r.token_type
        if (!userAccessToken) {
            res.status(401).json({ 'message': 'Unauthorised' })
        }
        const userDetailsRequestHeaders = { 'Authorization': tokenType + ' ' + userAccessToken }

        // Use temporary token to request user details from Github
        const userDetailsRequest = await requestify.request(provider.service.userDetailsRequestUrl, { method: 'GET', headers: userDetailsRequestHeaders })
        const ghUser = JSON.parse(userDetailsRequest.body)
        const username = ghUser.login
        const userId = ghUser.id

        console.log('User ' + username + ' w/ ID: ' + userId + ' logged in using ' + 'github')

        ghUser.role = 'user'
        ghUser.external_id = ghUser.id
        ghUser.source = 'github'

        let user = await UserService.getByExternalId(ghUser.external_id, ghUser.source = 'github')
        if (!user) {
            user = await new User(ghUser).save()
        }

        if (userId && username) {
            // Login has succeeded, generate JWT token and return it to the client
            res.status(200).json({ 'access_token': generateToken(user), 'userId': user.id })
        } else {
            // If we now do not have a user from Github, we assume that the login has failed
            res.status(401).json({ 'message': 'Unauthorised' })
        }
    } else {
        res.status(401).json({ 'message': 'Unauthorised' })
    }
}

const generateToken = (user) => {
    const jwtPayload = {
        id: user.id,
        username: user.login,
        created: Date.now(),
        expires: Date.now() + jwtTokenValidity,
        source: user.source,
        role: user.role
    }
    const token = jwt.encode(jwtPayload, process.env.JWT_SECRET)
    return token
}

export const authoriseRequest = async (req, res, next) => {
    let authorised = false;
    const authorization = req.headers.authorization
    if (authorization && authorization.includes('Bearer')) {
        const payload = decodeToken(authorization.replace('Bearer ', ''))
        if (payload) {
            const user = await UserService.get(payload.id)
            if (user) {
                req.requestUser = user
                authorised = true;
                next()
            }
        }
    }
    if (!authorised) {
        res.status(401).json({ 'message': 'Unauthorised' })
    }
}

const decodeToken = (jwtToken) => {
    let payload = null;
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
        // Valid token
        return payload
    }
}
