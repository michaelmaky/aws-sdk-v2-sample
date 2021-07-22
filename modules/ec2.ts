import AWS from 'aws-sdk';
// import proxy from 'proxy-agent';
const util = require('util');

export const getSubnetIdByName = async (vpcId: string, subnetName: string) => {
  const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

  const paramsEC2 = {
    Filters: [
      {
        Name: 'vpc-id',
        Value: [vpcId],
      },
    ],
  };

  let subnetId: string = '';
  const subnets = await ec2.describeSubnets(paramsEC2).promise();

  subnets.Subnets?.forEach((s) => {
    const tags = s.Tags?.filter((t) => t.Key === 'Name' && t.Value === subnetName);
    if (tags && tags.length > 0) {
      if (s.SubnetId) {
        subnetId = s.SubnetId;
      }
    }
    //console.log('subnetIds:', util.inspect(subnetIds || [], false, null, true));
    // console.log(
    //   'filter by AvailabilityZoneId',
    //   data.Subnets?.filter((s) => s.AvailabilityZoneId === 'apse1-az2').map((s) => s.SubnetId),
    // );
  });
  return subnetId;
};
