import AWS from 'aws-sdk';
import { GetSecretValueRequest, GetSecretValueResponse } from 'aws-sdk/clients/secretsmanager';
import { GetParameterRequest, GetParameterResult } from 'aws-sdk/clients/ssm';
import { retrieveParameter, retrieveSecret } from '../../src/capabilities/capability-environment';

const AWSMock = require('aws-sdk-mock');
AWSMock.setSDKInstance(AWS);

describe('capability-environment', () => {

    beforeAll(() => {
        AWSMock.mock('SSM', 'getParameter', (_request: GetParameterRequest, callback: Function) => {
            let Value = undefined;

            switch (_request.Name) {
                case 'FOUND': {
                    Value = { Value: 'Yes' }; break;
                }
            }

            const result: GetParameterResult = { Parameter: Value };
            callback(null, result);
        });
        AWSMock.mock('SecretsManager', 'getSecretValue', (_request: GetSecretValueRequest, callback: Function) => {
            let value: string = undefined;

            switch (_request.SecretId) {
                case 'FOUND': { value = 'Yes'; break; }
            }

            const result: GetSecretValueResponse = { SecretString: value };
            callback(null, result);
        });

    });

    it('retrieveParameter - throws exception', async () => {

        try {
            await retrieveParameter('NOT_FOUND');
            fail('Expected exception not thrown');
        } catch (error) {
            expect(error.message).toBe('Parameter \'NOT_FOUND\' not found');
        }
    });

    it('retrieveParameter - found', async () => {
        const value = await retrieveParameter('FOUND');
        expect(value).toBe('Yes');
    });

    it('retrieveSecret - throws exception', async () => {

        try {
            await retrieveSecret('NOT_FOUND');
            fail('Expected exception not thrown');
        } catch (error) {
            expect(error.message).toBe('SecretString \'NOT_FOUND\' not found');
        }
    });

    it('retrieveSecret - found', async () => {
        const value = await retrieveSecret('FOUND');
        expect(value).toBe('Yes');
    });

});
