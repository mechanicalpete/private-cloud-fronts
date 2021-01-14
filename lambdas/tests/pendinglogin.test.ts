const AWSMock = require('aws-sdk-mock');
import AWS from 'aws-sdk';
AWSMock.setSDKInstance(AWS);

import { handler } from '../src/pendinglogin';
import { GetParameterRequest, GetParameterResult } from 'aws-sdk/clients/ssm';
import { produceAPIGatewayProxyEvent, produceContext } from './__supporting/factory';

describe('pendinglogin', () => {

    it('pendinglogin - with all required environment variables', async () => {
        AWSMock.mock('SSM', 'getParameter', (_request: GetParameterRequest, callback: Function) => {
            let Value: string;

            switch (_request.Name) {
                case 'IDP_REDIRECTION_DOMAIN': { Value = 'localhost'; break; }
                default: throw new Error(`Unexpected value: ${_request.Name}`);
            }

            const result: GetParameterResult = { Parameter: { Value } };
            callback(null, result);
        })

        const event = produceAPIGatewayProxyEvent();
        const context = produceContext();
        const result = await handler(event, context);

        expect(result.statusCode).toBe(200);
        expect(result.headers['Access-Control-Allow-Origin']).toBe(`https://localhost`);
        expect(result.headers['Content-Type']).toBe('text/html');
        expect(result.body.indexOf("window.location.assign(protocol + hostname + pathname + '?' + fragment);")).toBeGreaterThan(0);

    });

});