import AWS, { ELBv2 } from 'aws-sdk';
// import proxy from 'proxy-agent';
const util = require('util');
import { getSubnetIdByName } from './ec2';

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

export const getTargetGroupsByVpcId = async (vpcId: string) => {
  const res = await getTargetGroups();

  let filteredTargetGroups: Array<ELBv2.TargetGroup> = [];
  if (res.TargetGroups) {
    res.TargetGroups?.forEach((tg) => {
      if (tg.VpcId === vpcId) {
        filteredTargetGroups.push(tg);
      }
    });
  }
  return filteredTargetGroups;
};

export const getTargetHealth = async (targetGroupArn: string) => {
  const params = {
    TargetGroupArn: targetGroupArn,
  };
  const res = await elbv2.describeTargetHealth(params).promise();
  return res;
};

export const registerTargets = async (input: AWS.ELBv2.RegisterTargetsInput) => {
  try {
    const ouput = await elbv2.registerTargets(input).promise();
    return ouput;
  } catch (e) {
    console.log('err', e.stack);
  }
};

export const deregisterTargets = async (input: AWS.ELBv2.DeregisterTargetsInput) => {
  try {
    const ouput = await elbv2.deregisterTargets(input).promise();
    return ouput;
  } catch (e) {
    console.log('err', e.stack);
  }
};

// deregister
export const deregisterTargetsBySubnetName = async (vpcId: string, subnetName: string) => {
  // get subnet id by name
  const subnetId = await getSubnetIdByName(vpcId, subnetName);
  // get target group under vpc id
  const targetGroups = await getTargetGroupsByVpcId(vpcId);
  // get targetHealth list by targetGroups.TargetGroupArn
  let targetHealthList: Array<AWS.ELBv2.DescribeTargetHealthOutput>;
  targetGroups?.forEach(async (tg) => {
    if (tg.TargetGroupArn) {
      const tgh = await getTargetHealth(tg.TargetGroupArn);
      targetHealthList.push(tgh);
    }
  });
  // TargetHealthDescriptions.Target = instance

  // get load balancer
  const elbs = await getElbV2();
  if (elbs && elbs.LoadBalancers) {
    elbs.LoadBalancers.map(async (lb) => {});
  }

  console.log('targetHealths', util.inspect(targetHealthList, false, null, true));
};
