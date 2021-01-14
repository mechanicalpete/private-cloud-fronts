process.env.IDP_REDIRECTION_URL = 'IDP_REDIRECTION_URL';
process.env.IDP_USER_POOL_ID = 'IDP_USER_POOL_ID';
process.env.IDP_USER_POOL_REGION = 'IDP_USER_POOL_REGION';
process.env.IDP_USER_POOL_DOMAIN = 'IDP_USER_POOL_DOMAIN';
process.env.IDP_USER_POOL_CLIENT = 'IDP_USER_POOL_CLIENT';
process.env.IDP_REDIRECTION_DOMAIN = 'IDP_REDIRECTION_DOMAIN';

process.env.CLOUDFRONT_KEY_PAIR_ID = 'CLOUDFRONT_KEY_PAIR_ID';
process.env.CLOUDFRONT_PRIVATE_KEY = 'CLOUDFRONT_PRIVATE_KEY';

const AWSMock = require('aws-sdk-mock');
import AWS from 'aws-sdk';
AWSMock.setSDKInstance(AWS);

jest.mock("aws-xray-sdk", () => {
    return {
        captureAWS(_module: any): any {
            return require("aws-sdk");
        },
        captureHTTPsGlobal(_module: any): any {
            return require("aws-sdk");
        },
        getSegment(): any {
            return {
                addNewSubsegment(_name: string): any {
                    return {
                        close(): void { },
                        addError(_error: Error): void { },
                        addAnnotation(_id: any, _value: any): void { },
                        addMetadata(_key: string, _value: any, _namespace?: string): void { },
                        addAttribute(_name: string, _data: any): void { },
                        isClosed(): boolean {
                            return false;
                        }
                    };
                },
                close(): void { },
                isClosed(): boolean {
                    return false;
                }
            };
        }
    };
});
