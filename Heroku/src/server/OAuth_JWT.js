"use strict";
const qs = require(`querystring`);
const { createSign } = require('crypto');

module.exports = class OAuth_JWT {
    util = null;

    constructor({ util }) {
        // debugger;
        this.util = util;
        this.util.oauthJWT = this;
    }

    async authorize({ clientId, username, audience, privateKey }) {
        return new Promise((resolve, reject) => {
            let JWT = this.createJWT({ clientId, username, audience });
            let signedJWT = this.signJWT({ JWT, privateKey });

            this.util.makeCallout({
                method: "POST", url: `${audience}/services/oauth2/token`, contentType: "FORM", postData: qs.stringify({
                    grant_type: `urn:ietf:params:oauth:grant-type:jwt-bearer`,
                    assertion: signedJWT
                })
            })
                .then((response) => {
                    resolve(response.body);
                })
                .catch((error) => {
                    reject(error);
                })
        })
    }

    createJWT({ clientId, username, audience }) {
        let header = { alg: 'RS256' };
        header = JSON.stringify(header);
        header = this.toBase64url(header);

        let claimsSet = this.getClaimsSet({ clientId, username, audience });
        claimsSet = JSON.stringify(claimsSet);
        claimsSet = this.toBase64url(claimsSet);

        let stringJWT = `${header}.${claimsSet}`;
        return stringJWT;
    }

    signJWT({ JWT, privateKey }) {
        const sign = createSign('RSA-SHA256');
        sign.update(JWT);
        sign.end();

        let signedJWT = sign.sign(privateKey);
        signedJWT = this.toBase64url(signedJWT);

        return `${JWT}.${signedJWT}`;
    }

    getClaimsSet({ clientId, username, audience }) {
        let maxTimeoutMinutes = 3;
        return {
            iss: clientId,
            sub: username,
            aud: audience,
            exp: Math.floor(Date.now() / 1000) + (60 * maxTimeoutMinutes)
        };
    }

    toBase64url(string) {
        // This encoding is technically identical to the [Base64], except for the 62:nd ('+' => '-') and 63:rd ('/' => '_') alphabet character
        // https://datatracker.ietf.org/doc/html/rfc4648#section-5

        let output = this.util.toBase64(string);
        output = output.replace(/\+/g, '-').replace(/\//g, '_');
        // output = output.replace(/=/g, '');
        return output;
    }
}