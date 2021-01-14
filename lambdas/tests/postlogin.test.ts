import AWS from 'aws-sdk';
import { GetParameterRequest, GetParameterResult } from 'aws-sdk/clients/ssm';
import { AxiosResponse } from 'axios';
import fs from 'fs';
import { handler } from '../src/postlogin';
import { produceAPIGatewayProxyEvent, produceContext } from './__supporting/factory';
const AWSMock = require('aws-sdk-mock');
AWSMock.setSDKInstance(AWS);

const PAYLOAD = fs.readFileSync('tests/__supporting/jwks.json', 'utf8');
const EXPIRED_JWT = 'eyJraWQiOiJ6XC8xZjRZSjlLMjBrYWJmSFJGeXZFM0NVOU5oanduVko4UWlhT2xTaUVGUT0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiM2FTS1VENDFJMV9hWTBsSUstaGgzUSIsInN1YiI6IjQzOWI1MGY3LWMwNjItNDk4Yy1iZmNiLTUzMjY5NDBjODFhOSIsImF1ZCI6IjFlb2Mzcm9jMDg1ZWFnamQ5bDZkcTY4Y2k3IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJldmVudF9pZCI6IjE0NTVkZjg3LWFmNjYtNGI2Yy04MWQ1LTM5MDUxZTYxYzI1MiIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjEwMDE4MzE5LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfY1EzS3pvU0NGIiwiY29nbml0bzp1c2VybmFtZSI6IjQzOWI1MGY3LWMwNjItNDk4Yy1iZmNiLTUzMjY5NDBjODFhOSIsImV4cCI6MTYxMDA2MTUxOSwiaWF0IjoxNjEwMDE4MzE5LCJlbWFpbCI6InBldGVAZXhhbXBsZS5jb20ifQ.QR2X_4-j3r3-V_N3obalqWJdEm6tmktQ4TWLhlngT_QLD60r_TA3UIJ8m78JugkLVIZJPuFvIbk5PCO9qVqsNba1CeIA-nQDEkKe1iqUv6ORaE-Qfb4XJXffGiHsvXVWEpyIChgdWZKa68d1EAzOtoV_XzQCTb-sTNKekrdzfEMVwHAT6-OpaFKc6m710xhb7qH3majTnF9rhJDBfDcHKlDLKSevOmlXswm8uUnMUTxOSPjkt6Jp6WiAeboaM7F0fzAud5ud7msZuLZWtl6txJS4cG5yDO6Lhdeyjy8aA39OhGuKFvHWaQ-tyvAp1VHI54kCh3zovNhHjaVSei7ejQ';

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

describe('postlogin', () => {

    beforeAll(() => {
        AWSMock.mock('SSM', 'getParameter', (_request: GetParameterRequest, callback: Function) => {
            let Value: string;

            switch (_request.Name) {
                case 'IDP_USER_POOL_ID': { Value = '@@AWS_REGION@@_cQ3KzoSCF'; break; }
                case 'IDP_USER_POOL_REGION': { Value = '@@AWS_REGION@@'; break; }
                case 'IDP_REDIRECTION_DOMAIN': { Value = 'localhost'; break; }
                default: throw new Error(`Unexpected value: ${_request.Name}`);
            }

            const result: GetParameterResult = { Parameter: { Value } };
            callback(null, result);
        })
    });

    it('postlogin - missing JWT - throws exception', async () => {

        const event = produceAPIGatewayProxyEvent();
        const context = produceContext();
        try {
            await handler(event, context);
            fail('Expected exception not thrown');
        } catch (error) {
            expect(error.message).toBe('Cannot read property \'id_token\' of null');
        }
    });

    it('postlogin - invalid JWT', async () => {

        const event = produceAPIGatewayProxyEvent({ id_token: 'ZZZ' });
        const context = produceContext();

        try {
            await handler(event, context);
        } catch (error) {
            expect(error.message).toBe('requested token is invalid');
        }
    });

    it('postlogin - expired JWT', async () => {

        const event = produceAPIGatewayProxyEvent({ id_token: EXPIRED_JWT });
        const context = produceContext();

        try {
            await handler(event, context);
        } catch (error) {
            expect(error.message).toBe('jwt expired');
        }

    });

});
