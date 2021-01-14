/* istanbul ignore file */

import * as Axios from 'axios';
import * as jsonwebtoken from 'jsonwebtoken';
import { promisify } from 'util';
const jwkToPem = require('jwk-to-pem');

/**
 * Code related to `verifyJwt` taken, and minimally modified, from: https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts
 */

export interface ClaimVerifyRequest {
    readonly token?: string;
}

export interface ClaimVerifyResult {
    readonly userName: string;
    readonly clientId: string;
    readonly isValid: boolean;
    readonly expiryInSeconds: number;
    readonly error?: any;
}

interface TokenHeader {
    kid: string;
    alg: string;
}

interface PublicKey {
    alg: string;
    e: string;
    kid: string;
    kty: string;
    n: string;
    use: string;
}

interface PublicKeyMeta {
    instance: PublicKey;
    pem: string;
}

interface PublicKeys {
    keys: PublicKey[];
}

interface MapOfKidToPublicKey {
    [key: string]: PublicKeyMeta;
}

interface Claim {
    token_use: string;
    auth_time: number;
    iss: string;
    exp: number;
    username: string;
    client_id: string;
}


let cacheKeys: MapOfKidToPublicKey | undefined;
const getPublicKeys = async (cognitoIssuer: string): Promise<MapOfKidToPublicKey> => {
    if (!cacheKeys) {
        const url = `${cognitoIssuer}/.well-known/jwks.json`;
        const publicKeys = await Axios.default.get<PublicKeys>(url);
        cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
            const pem = jwkToPem(current);
            agg[current.kid] = { instance: current, pem };
            return agg;
        }, {} as MapOfKidToPublicKey);
        return cacheKeys;
    } else {
        return cacheKeys;
    }
};

const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

export async function verifyJwt(cognitoIssuer: string, token: string): Promise<ClaimVerifyResult> {
    let result: ClaimVerifyResult;
    try {
        console.log(`user claim verify invoked for ${JSON.stringify(token)}`);
        const tokenSections = (token || '').split('.');
        console.log(`tokenSections: ${tokenSections}`);
        if (tokenSections.length < 2) {
            console.log(`tokenSections.length: ${tokenSections.length}`);
            throw new Error('requested token is invalid');
        }
        const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
        console.log(`headerJSON: ${headerJSON}`);
        const header = JSON.parse(headerJSON) as TokenHeader;
        console.log(`header: ${JSON.stringify(header)}`);
        const keys = await getPublicKeys(cognitoIssuer);
        console.log(`keys: ${keys}`);
        const key = keys[header.kid];
        console.log(`key: ${key}`);
        if (key === undefined) {
            console.log(`key: is undefined`);
            throw new Error('claim made for unknown kid');
        }
        const claim = await verifyPromised(token, key.pem) as Claim;
        console.log(`: ${claim}`);
        const currentSeconds = Math.floor((new Date()).valueOf() / 1000);
        console.log(`currentSeconds: ${currentSeconds}`);
        if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
            console.log('claim is expired or invalid');
            throw new Error('claim is expired or invalid');
        }
        if (claim.iss !== cognitoIssuer) {
            console.log('claim issuer is invalid');
            throw new Error('claim issuer is invalid |' + claim.iss + '|'+ cognitoIssuer+'|');
        }
        if (claim.token_use !== 'id') {
            console.log(`claim.token_use: ${claim.token_use}`);
            console.log('claim use is not id');
            throw new Error('claim use is not id');
        }
        console.log(`claim confirmed for ${claim.username}`);
        result = { userName: claim.username, clientId: claim.client_id, isValid: true, expiryInSeconds: claim.exp };
    } catch (error) {
        result = { userName: '', clientId: '', error, isValid: false, expiryInSeconds:0 };
    }
    return result;
};
