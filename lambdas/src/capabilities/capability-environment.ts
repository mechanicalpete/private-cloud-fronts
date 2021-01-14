import { Config, SecretsManager, SSM } from 'aws-sdk';
import { GetSecretValueRequest, GetSecretValueResponse } from 'aws-sdk/clients/secretsmanager';
import { GetParameterRequest, GetParameterResult } from 'aws-sdk/clients/ssm';

let ssmClient: SSM = undefined;
let secretsManagerClient: SecretsManager = undefined;
let cache: {} = {};

export async function retrieveParameter(name: string): Promise<string> {
    if (cache[name] === undefined)
        cache[name] = await getParameter(name);
    return cache[name];
}

async function getParameter(name: string): Promise<string> {
    const request: GetParameterRequest = { Name: name, WithDecryption: true };
    const result: GetParameterResult = await getSSMClient().getParameter(request).promise();

    if (result && result.Parameter) {
        return result.Parameter.Value;
    }
    throw new Error(`Parameter '${name}' not found`);
}

export async function retrieveSecret(name: string): Promise<string> {
    if (cache[name] === undefined)
        cache[name] = await getSecret(name);
    return cache[name];
}

async function getSecret(name: string): Promise<string> {
    const request: GetSecretValueRequest = { SecretId: name };
    const result: GetSecretValueResponse = await getSecretsManagerClient().getSecretValue(request).promise();

    if (result && result.SecretString) {
        return result.SecretString;
    }
    throw new Error(`SecretString '${name}' not found`);
}

export function getSSMClient(): SSM {

    console.log('getSSMClient()');

    /* istanbul ignore next */
    if (!ssmClient) {
        let configurationParameterStore: AWS.SSM.ClientConfiguration = new Config();

        configurationParameterStore.apiVersion = '2014-11-06';
        /* istanbul ignore next */ // Overrides for local testing with localstack
        if (process.env.OVERRIDE_AWSSDK_ENDPOINT) {
            configurationParameterStore.endpoint = process.env.OVERRIDE_AWSSDK_ENDPOINT;
            configurationParameterStore.credentials = { accessKeyId: 'string', secretAccessKey: 'string' };
            configurationParameterStore.region = '@@AWS_REGION@@';
        }

        ssmClient = new SSM(configurationParameterStore);
    }

    return ssmClient;
}

export function getSecretsManagerClient(): SecretsManager {

    console.log('getSecretsManagerClient()');

    /* istanbul ignore next */
    if (!secretsManagerClient) {
        let configurationParameterStore: AWS.SecretsManager.ClientConfiguration = new Config();

        configurationParameterStore.apiVersion = '2017-10-17';
        /* istanbul ignore next */ // Overrides for local testing with localstack
        if (process.env.OVERRIDE_AWSSDK_ENDPOINT) {
            configurationParameterStore.endpoint = process.env.OVERRIDE_AWSSDK_ENDPOINT;
            configurationParameterStore.credentials = { accessKeyId: 'string', secretAccessKey: 'string' };
            configurationParameterStore.region = '@@AWS_REGION@@';
        }

        secretsManagerClient = new SecretsManager(configurationParameterStore);
    }

    return secretsManagerClient;
}
