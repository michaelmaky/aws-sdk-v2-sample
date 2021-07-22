import AWS from 'aws-sdk';
// import proxy from 'proxy-agent';
const util = require('util');
import { getSubnetIdByName } from './subnet';

const elbv2 = new AWS.ELBv2();

export const getElbV2 = async () => {
  const params = {};
  const res = await elbv2.describeLoadBalancers(params).promise();
  return res;
};

export const getTargetGroups = async () => {
  const params = {};
  const res = await elbv2.describeTargetGroups(params).promise();
  return res;
};

export const getTargetHealth = async (targetGroupArn: string) => {
  const params = {
    TargetGroupArn: targetGroupArn,
  };
  const res = await elbv2.describeTargetHealth(params).promise();
  return res;
};
