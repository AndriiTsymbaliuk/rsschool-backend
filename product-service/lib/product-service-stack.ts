import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Mock data for products
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 100 },
      { id: '2', name: 'Product 2', price: 200 },
      { id: '3', name: 'Product 3', price: 300 },
    ];

    // Create the getProductsList Lambda function
    const getProductsListFunction = new lambda.Function(this, 'GetProductsListFunction', {
      runtime: lambda.Runtime.NODEJS_14_X, // Choose the runtime
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          const products = ${JSON.stringify(mockProducts)};
          return {
            statusCode: 200,
            body: JSON.stringify(products),
            headers: {
              'Content-Type': 'application/json',
            },
          };
        };
      `),
      handler: 'index.handler',
    });

    // Create the getProductsById Lambda function
    const getProductsByIdFunction = new lambda.Function(this, 'GetProductsByIdFunction', {
      runtime: lambda.Runtime.NODEJS_14_X, // Choose the runtime
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          const products = ${JSON.stringify(mockProducts)};
          const productId = event.pathParameters.productId;
          const product = products.find(p => p.id === productId);
          
          if (product) {
            return {
              statusCode: 200,
              body: JSON.stringify(product),
              headers: {
                'Content-Type': 'application/json',
              },
            };
          } else {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: 'Product not found' }),
              headers: {
                'Content-Type': 'application/json',
              },
            };
          }
        };
      `),
      handler: 'index.handler',
    });

    // Create an API Gateway
    const api = new apigateway.RestApi(this, 'ProductServiceApi', {
      restApiName: 'Product Service',
      description: 'This service serves products.',
    });

    // Create a resource and method for the getProductsList Lambda function
    const products = api.root.addResource('products');
    products.addMethod('GET', new apigateway.LambdaIntegration(getProductsListFunction));

    // Create a resource for getProductsById
    const product = products.addResource('{productId}');
    product.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFunction));
  }
}
