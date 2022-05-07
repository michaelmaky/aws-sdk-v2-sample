import AWS from 'aws-sdk';
import * as fs from 'fs';
// import proxy from 'proxy-agent';
const util = require('util');

const ssm = new AWS.SSM({ apiVersion: '2016-11-15' });
AWS.config.update({ region: process.env.AWS_REGION });

export const getParametersByPath = async (path: string = '/', recursive = true) => {
  const paramsSSM = {
    Path: path,
    Recursive: recursive,
  };

  const ssmParameters = await ssm.getParametersByPath(paramsSSM).promise();
  console.info('ssmParameters', ssmParameters);
  return ssmParameters;
};

export const exportParametersToJSON = async (path: string = '/', recursive = true) => {
  const ssmParameters = await getParametersByPath(path, recursive);

  let output: {
    data: Array<any>;
  } = { data: [] };

  const ssmPrefix: string = process.env.SSM_PREFIX || '';
  ssmParameters?.Parameters?.forEach(async (obj) => {
    const subset = (({ Name, Value }) => ({ Name, Value }))(obj);
    // remove alias base on env
    if (process.env.SSM_REMOVE_PREFIX === 'true' && ssmPrefix.length > 0) {
      if (subset.Name?.startsWith(ssmPrefix)) {
        subset.Name = subset.Name.slice(ssmPrefix.length);
      }
    }
    console.log(subset);
    output.data.push(subset);
  });
  // export to json file
  fs.writeFileSync('ssm-' + new Date().toISOString() + '.json', JSON.stringify(output, null, 4), 'utf8');
};
