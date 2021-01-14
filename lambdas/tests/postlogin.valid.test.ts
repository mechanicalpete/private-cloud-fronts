import AWS from 'aws-sdk';
import { GetSecretValueRequest, GetSecretValueResponse } from 'aws-sdk/clients/secretsmanager';
import { GetParameterRequest, GetParameterResult } from 'aws-sdk/clients/ssm';
import { AxiosResponse } from 'axios';
import fs from 'fs';
import { ClaimVerifyResult } from '../src/capabilities/capability-cognito';
import { handler } from '../src/postlogin';
import { produceAPIGatewayProxyEvent, produceContext } from './__supporting/factory';
const AWSMock = require('aws-sdk-mock');
AWSMock.setSDKInstance(AWS);

const PAYLOAD = fs.readFileSync('tests/__supporting/jwks.json', 'utf8');
const EXPIRED_JWT = 'eyJraWQiOiJ6XC8xZjRZSjlLMjBrYWJmSFJGeXZFM0NVOU5oanduVko4UWlhT2xTaUVGUT0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiWHBHemQybHA2cjltdTRCb3pIbGpiZyIsInN1YiI6IjQzOWI1MGY3LWMwNjItNDk4Yy1iZmNiLTUzMjY5NDBjODFhOSIsImF1ZCI6IjFlb2Mzcm9jMDg1ZWFnamQ5bDZkcTY4Y2k3IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTYwOTk5Mzg1OSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC0yLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoZWFzdC0yX2NRM0t6b1NDRiIsImNvZ25pdG86dXNlcm5hbWUiOiI0MzliNTBmNy1jMDYyLTQ5OGMtYmZjYi01MzI2OTQwYzgxYTkiLCJleHAiOjE2MTAwMzcwNTksImlhdCI6MTYwOTk5Mzg1OSwiZW1haWwiOiJwZXRlQGV4YW1wbGUuY29tIn0.diViKKpayj7gIIv7RlctAYbHVILbXk3tB5QzXGHC9nU1f75T8hTNXEKgiL_Xey2-D9U6dsXkIzULm_AG97deLLrHq9Iv0fpzEl7bcnTMWxOPKahGpHhvdgVJc0JqEZ-7swuG4jiVjIYsSkAilLnHd6E2O5kpjsS02jCoiYMsBot_DYqJwkmDRfFRGFO_AfYQnOWyUP-OUC_6Yf6IYTpIeIYAy0MDrsRhtAdR-2xiM74_s3uxhDtQVEeYWKKb1PHnZwq_-Y6EKCEMnO5l3Y2cpm79c-u9Il4wdkdHgeqVK0Up54HXT8uyhu9uaISKV96T54n3jpstkZJcuLWtTg1uAQ';
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAy9AIve8QHpva3UsikCmQRy2zFF1NEhvdijgULAH9xvXzIrDn
84qFSJJBGP7RvYfcWyPFA9q74GgjL4NT54bttE0rFtXanv/X0SGhNF8vUZBMnZGF
SbMjQXCapLIiAN28Eoln9G0FsZNfpmA4VzkI9opte0LBnqnLCUPQauR1BLCG7u0R
FOpA7JIYSBu/KNG+cTTryXf2xF8m6SdtbF5TmZyXnD4GRRgox+sXjL+MySt9KD7+
nsChhlJg/nrJFjzupSU51tE9QapAUGC8+QI4vuxdaItX86JxdtD+tzna6qT2MJAv
5cMXQ3V6spBe0emvyIsMXl/4nBSJ6n8h/1o/2wIDAQABAoIBABdy086mVoBvBfs3
zb4wSf0mcNgC8/8FXbOtSATYJc5iNZrkJ4uJgFQdH4g0qQTZQKzrrJsI61yiHoo0
3c5hY6++wRpbeE+at8XDzLwtx0/m/imSuHcGOSQqRGB2bhsTZ7PqQx+H+4O2pOaL
Y3AFi9Zxjq8Duyr59fYW6z+hESV8xTVaEWi34suSXTPswKr7AOl8qnpNt73j/zM0
X5awtQ8qv8fZBBF4Gy1HUltP0TPCLOGQBoRp5RlwKqgz7ZrF9ufLG8ZgwHw7XxoE
MiT7FcLm1DTiDH/fpqY/nR89kFYyU8pDT4GHf/2x9pA8FdsuyrbXkBn4bRMiProm
CPE7NKECgYEA6oXQ8htDvHxsOcji0DgQlrSBGAfD22voTml54SUyZ2cneK2J48WE
8cDhIgTMx4F9pFOgszsGg11QsczsGrarYSQxkUwbUnIBWUMZ8BJL/xuy2lI90ACn
TCBU7D1iBYDUTTRmfzvwy7aEU/anGt+e6vVsYrBwUh3OT4y9lbqM1gcCgYEA3no/
EORrl73KlER8i88VxJRzDCcCq7lOEOL4AySHvPCYvQ/QYsmVxfzEtXnAGK5fMR2E
Wi2GdYIN52ft0mgjoFJNCQ00h6MeiSkkKeP0Ml9M08R4IM4JLy/5TzizCzOsMiHP
/v8krfi1QDEGQe8lfiYFkvKAdIfN1oiCkDttMo0CgYAyOj6p25UCRVOYfKG3HorO
/BG558/WqqGySXzE74aABuO5QNGLar4yWLDe7FA/WkhibVa5jCa088NYkR7wCbdi
srG7AKXJXolTaL+hXwnPtUr03zBF4B30e+g0QGFB9HmDn3lkPp4vwwNMSEM5yjLq
920jJc6oh6Gr/+SKsM2A+QKBgBYP418md7D1hjhLzloC8DKtUfdbiv1ChAZSq6uM
HNXUuiDNh6m0OeEHXu5sI2uPJyt0tOJIb3QJsJ1JBiF+aEIGx1Lld1cYCvgpF0f8
LgQsxS6e5hbCt9BxHnUHt2Gd/y59geXUoWuLJVY3RlqVf49R7+2RlMF5kiT7Jo9t
BTglAoGAYyz67orWJVNZ9Hx7wldcoKAJB4tWoFlwB8caFpyiwj1kkyCeAkDSmM8Z
rnJIxPc0xShI4gdUU0hslaV8sZXQ7KkbycGTbYzh1ima+X9O2AQTabYS0uZZGs42
BPUumQDhVS1ANZe2GmZsPf+CiMUvr82/UuxDjn8pTrLYvElL8R8=
-----END RSA PRIVATE KEY-----
`;

const axiosResponse: AxiosResponse = {
    data: JSON.parse(PAYLOAD),
    status: 200,
    statusText: 'OK',
    config: {},
    headers: {},
};
jest.mock("axios", () => {
    return {
        // Typescript requires a 'default'
        default: {
            get: jest.fn().mockImplementation(() => Promise.resolve(axiosResponse)),
        },
        get: jest.fn(() => Promise.resolve(axiosResponse)),
    };
});
jest.mock('../src/capabilities/capability-cognito', () => {
    return {
        verifyJwt: async (): Promise<ClaimVerifyResult> => {
            return Promise.resolve({
                userName: 'jest-username',
                clientId: 'jest-clientId',
                isValid: true,
                expiryInSeconds: Date.now()
            });
        }
    }
});

describe('postlogin', () => {

    beforeAll(() => {
        AWSMock.mock('SSM', 'getParameter', (_request: GetParameterRequest, callback: Function) => {
            let Value: string;

            switch (_request.Name) {
                case 'IDP_USER_POOL_ID': { Value = '@@AWS_REGION@@_cQ3KzoSCF'; break; }
                case 'IDP_USER_POOL_REGION': { Value = '@@AWS_REGION@@'; break; }
                case 'IDP_REDIRECTION_DOMAIN': { Value = 'localhost'; break; }
                case 'CLOUDFRONT_KEY_PAIR_ID': { Value = 'KPI12345678'; break; }
                default: throw new Error(`Unexpected value: ${_request.Name}`);
            }

            const result: GetParameterResult = { Parameter: { Value } };
            callback(null, result);
        });
        AWSMock.mock('SecretsManager', 'getSecretValue', (_request: GetSecretValueRequest, callback: Function) => {
            let value: string;

            switch (_request.SecretId) {
                case 'CLOUDFRONT_PRIVATE_KEY': { value = PRIVATE_KEY; break; }
                default: throw new Error(`Unexpected value: ${_request.SecretId}`);
            }

            const result: GetSecretValueResponse = { SecretString: value };
            callback(null, result);
        });
    });


    it('postlogin - valid JWT', async () => {


        const event = produceAPIGatewayProxyEvent({ id_token: EXPIRED_JWT });
        const context = produceContext();

        const result = await handler(event, context);

        expect(result.statusCode).toBe(307);
        expect(result.headers['Access-Control-Allow-Credentials']).toBe(true);
        expect(result.headers['Access-Control-Allow-Origin']).toBe(`https://localhost`);
        expect(result.headers['Location']).toBe(`https://localhost/index.html`);
        expect(result.headers['SET-Cookie']).toBe('CloudFront-Key-Pair-Id=KPI12345678;Domain=localhost;Path=/;Secure;HttpOnly');
        expect(result.headers['Set-Cookie']).toMatch(new RegExp('^CloudFront-Policy=e[a-zA-Z0-9]{147};Domain=localhost;Path=\/;Secure;HttpOnly$'));
        expect(result.headers['set-Cookie']).toMatch(new RegExp('^CloudFront-Signature=[a-zA-Z0-9\-~_]{344};Domain=localhost;Path=/;Secure;HttpOnly$'));
        expect(result.body).toBeUndefined();
    });

});
