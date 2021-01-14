import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Signer } from 'aws-sdk/clients/cloudfront';
import 'source-map-support/register';
import { verifyJwt } from './capabilities/capability-cognito';
import { retrieveParameter, retrieveSecret } from './capabilities/capability-environment';
import { CLOUDFRONT_KEY_PAIR_ID, CLOUDFRONT_PRIVATE_KEY, IDP_REDIRECTION_DOMAIN, IDP_USER_POOL_ID, IDP_USER_POOL_REGION } from './constants';

export async function handler(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {

  console.log(JSON.stringify(event), JSON.stringify(_context));

  const cognitoIssuer = await retrieveCognitoIssuer();
  const validatedJwt = await verifyJwt(cognitoIssuer, event.queryStringParameters['id_token']);

  if (validatedJwt.isValid) {
    const domain = await retrieveParameter(IDP_REDIRECTION_DOMAIN);
    const keyPairId: string = await retrieveParameter(CLOUDFRONT_KEY_PAIR_ID);
    const privateKey: string = await retrieveSecret(CLOUDFRONT_PRIVATE_KEY);
    const options: Signer.SignerOptionsWithPolicy = { policy: `{"Statement": [{"Resource": "https://${domain}/*","Condition": {"DateLessThan": {"AWS:EpochTime":${validatedJwt.expiryInSeconds}}}}]}` };
    const cookies: Signer.CustomPolicy = new Signer(keyPairId, privateKey).getSignedCookie(options);

    const headers = {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': `https://${domain}`,
      'Location': `https://${domain}/index.html`,
      'SET-Cookie': `CloudFront-Key-Pair-Id=${cookies["CloudFront-Key-Pair-Id"]};Domain=${domain};Path=/;Secure;HttpOnly`,
      'Set-Cookie': `CloudFront-Policy=${cookies["CloudFront-Policy"]};Domain=${domain};Path=/;Secure;HttpOnly`,
      'set-Cookie': `CloudFront-Signature=${cookies["CloudFront-Signature"]};Domain=${domain};Path=/;Secure;HttpOnly`,
    };

    return {
      statusCode: 307,
      headers,
      body: undefined
    };
  }

  console.error(JSON.stringify(validatedJwt));

  throw new Error(validatedJwt.error.message);
}

async function retrieveCognitoIssuer(): Promise<string> {
  const cognitoPoolId = await retrieveParameter(IDP_USER_POOL_ID);
  const cognitoPoolRegion = await retrieveParameter(IDP_USER_POOL_REGION);
  const cognitoIssuer = `https://cognito-idp.${cognitoPoolRegion}.amazonaws.com/${cognitoPoolId}`;

  return cognitoIssuer;
}
