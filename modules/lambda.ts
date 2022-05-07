import AWS from 'aws-sdk';
import * as fs from 'fs';
// import proxy from 'proxy-agent';
const util = require('util');

import { getSubnetIdByName } from './ec2';

// init AWS
AWS.config.update({ region: process.env.AWS_REGION });

export const getFunctions = async () => {
  const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });

  const params = {};

  const lambdas = await lambda.listFunctions(params).promise();
  console.info('lambdas', lambdas);
  return lambdas;
};

export const exportFunctionsToJSON = async () => {
  const lambdas = await getFunctions();

  let output: {
    data: Array<any>;
  } = { data: [] };

  lambdas?.Functions?.forEach(async (obj) => {
    const subset = (({ FunctionName, Environment }) => ({ FunctionName, Environment }))(obj);
    console.log(subset);
    output.data.push(subset);
  });
  // export to json file
  fs.writeFileSync('lambda-' + new Date().toISOString() + '.json', JSON.stringify(output, null, 4), 'utf8');
};

export const addLambdaToSubnet = async (vpcId: string, subnetName: string) => {
  await updateLambdaSubnet('add', vpcId, subnetName);
};

export const removeLambdaToSubnet = async (vpcId: string, subnetName: string) => {
  await updateLambdaSubnet('remove', vpcId, subnetName);
};

export const updateLambdaSubnet = async (action: string, vpcId: string, subnetName: string) => {
  const lambda = new AWS.Lambda();

  const subnetId = await getSubnetIdByName(vpcId, subnetName);
  let subnetIds: Array<string> = [];
  subnetIds.push(subnetId);

  // get functions
  const paramsLambda = {};
  const lambdas = await lambda.listFunctions(paramsLambda).promise();

  (lambdas.Functions || []).forEach((fn) => {
    if (!process.env.LAMBDA_NAME || process.env.LAMBDA_NAME === fn.FunctionName) {
      // check if specific LAMBDA_NAME want to run
      if (fn.FunctionName && fn.VpcConfig && fn.VpcConfig?.SubnetIds) {
        // update subnet id base on command value, e.g. npm start cmd=removeSubnet value=subnet-b
        let newSubnetIds = fn.VpcConfig?.SubnetIds;
        // subnet
        if (action === 'add') newSubnetIds.push(subnetId);
        if (action === 'remove') newSubnetIds = fn.VpcConfig?.SubnetIds.filter((subnet) => !subnetIds.includes(subnet));
        // security group
        let newSecurityGroupIds = fn?.VpcConfig.SecurityGroupIds;
        // last one to remove, also need make SecurityGroupIds = []
        if (newSubnetIds.length == 0) {
          newSecurityGroupIds = [];
        }

        console.log('newSubnetIds', util.inspect(newSubnetIds, false, null, true));
        console.log('newSecurityGroupIds', util.inspect(newSecurityGroupIds, false, null, true));

        const params = {
          FunctionName: fn.FunctionName,
          VpcConfig: {
            SecurityGroupIds: newSecurityGroupIds,
            SubnetIds: newSubnetIds,
          },
        };
        lambda.updateFunctionConfiguration(params, function (err, data) {
          if (err) console.log(err, err.stack);
          // an error occurred
          else console.log(data); // successful response
        });
      }
      // end check specific LAMBDA_NAME
    }
  });
};
