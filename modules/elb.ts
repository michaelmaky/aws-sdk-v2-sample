import AWS from 'aws-sdk';
// import proxy from 'proxy-agent';
const util = require('util');

import { getSubnetIdByName } from './subnet';

const elb = new AWS.ELB();

export const getELBs = async () => {
  const params = {};
  const res = await elb.describeLoadBalancers(params).promise();
  return res;
};

export const attachElbToSubnet = async (vpcId: string, subnetName: string) => {
  // get subnet id by name
  const subnetId = await getSubnetIdByName(vpcId, subnetName);

  const res = await getELBs();
  if (res && res.LoadBalancerDescriptions) {
    await Promise.all(
      res.LoadBalancerDescriptions.map(async (lb) => {
        if (lb.LoadBalancerName) {
          const params = {
            LoadBalancerName: lb.LoadBalancerName,
            Subnets: [subnetId],
          };
          console.log('attachElbToSubnet > params', params);
          // attach subnet to elb
          elb.attachLoadBalancerToSubnets(params, function (err, data) {
            if (err) console.error(err, err.stack);
            else console.log(data);
          });
        }
      }),
    );
  }
};

export const detachElbToSubnet = async (vpcId: string, subnetName: string) => {
  // get subnet id by name
  const subnetId = await getSubnetIdByName(vpcId, subnetName);

  const res = await getELBs();
  if (res && res.LoadBalancerDescriptions) {
    await Promise.all(
      res.LoadBalancerDescriptions.map(async (lb) => {
        if (lb.LoadBalancerName) {
          const params = {
            LoadBalancerName: lb.LoadBalancerName,
            Subnets: [subnetId],
          };
          console.log('detachElbToSubnet > params', params);
          // attach subnet to elb
          elb.detachLoadBalancerFromSubnets(params, function (err, data) {
            if (err) console.error(err, err.stack);
            else console.log(data);
          });
        }
      }),
    );
  }
};
