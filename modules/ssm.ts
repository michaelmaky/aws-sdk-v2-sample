import AWS from 'aws-sdk';
// import proxy from 'proxy-agent';
const util = require('util');

export const getParametersByPath = async (path: string = '/', recursive = true) => {
  const ssm = new AWS.SSM({ apiVersion: '2016-11-15' });

  const paramsSSM = {
    Path: path,
    Recursive: recursive,
  };

  const ssmParameters = await ssm.getParametersByPath(paramsSSM).promise();
  console.info('ssmParameters', ssmParameters);
  return ssmParameters;
};
