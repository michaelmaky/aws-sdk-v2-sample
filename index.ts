require('dotenv').config();
import AWS from 'aws-sdk';
import proxy from 'proxy-agent';
const util = require('util');

// init AWS
AWS.config.update({ region: process.env.AWS_REGION });

// const credentials = new AWS.SharedIniFileCredentials({ profile: process.env.AWS_PROFILE });
// AWS.config.credentials = credentials;
// AWS.config.update({
//   httpOptions: {
//     agent: proxy(`http://` + process.env.USERNAME + `:` + process.env.PASSWORD + process.env.AWS_PROXY_URL),
//   },
// });

// console.log(AWS.config);
// console.log(process.env.NODE_ENV);

const args = process.argv.slice(2);
console.log('args:', args);

// if (args.length !== 2) {
//   console.error('not a proper args', args);
// }

// base on cmd and value to determine the procedure need to run
const cmd = args[0].split('=')[1] || 'removeSubnet';
console.log('cmd:', cmd);

const value = args[1].split('=')[1] || 'subnet-b';
console.log('value:', value);

const lambda = new AWS.Lambda();

if (cmd === 'removeSubnet') {
  updateSubnet();
}

// update subnet for lambda
function updateSubnet() {
  const lambda = new AWS.Lambda();

  // get subnet
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

  const paramsEC2 = {
    Filters: [
      {
        Name: 'vpc-id',
        Values: [process.env.VPC_ID || ''],
      },
    ],
  };

  let subnetIds: Array<string> = [];
  ec2
    .describeSubnets(paramsEC2)
    .promise()
    .then((data) => {
      // console.log('subnets:', util.inspect(data, false, null, true)); // successful response

      data.Subnets?.forEach((s) => {
        const tags = s.Tags?.filter((t) => t.Key === 'Name' && t.Value === value);
        if (tags) {
          if (tags.length > 0) {
            if (s.SubnetId) {
              subnetIds.push(s.SubnetId);
            }
          }
        }
      });
      console.log('subnetIds:', util.inspect(subnetIds || [], false, null, true));
      //   console.log(
      //     'filter by AvailabilityZoneId',
      //     data.Subnets?.filter((s) => s.AvailabilityZoneId === 'apse1-az2').map((s) => s.SubnetId),
      //   );

      // get functions
      const paramsLambda = {};
      lambda
        .listFunctions(paramsLambda)
        .promise()
        .then((data) => {
          // console.log('functions:', util.inspect(data, false, null, true));

          (data.Functions || []).forEach((fn) => {
            if (!process.env.LAMBDA_NAME || process.env.LAMBDA_NAME === fn.FunctionName) {
              // check if specific LAMBDA_NAME want to run
              if (fn.FunctionName && fn.VpcConfig && fn.VpcConfig?.SubnetIds) {
                // update subnet id base on command value, e.g. npm start cmd=removeSubnet value=subnet-b
                const newSubnetIds = fn.VpcConfig?.SubnetIds.filter((subnet) => !subnetIds.includes(subnet));
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
                    // no change on sg
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
        });
    });
}
