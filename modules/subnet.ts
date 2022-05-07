import { addLambdaToSubnet, removeLambdaToSubnet } from './lambda';
import { attachElbToSubnet, detachElbToSubnet } from './elb';

export const removeResourcesFromSubnet = async (value: string) => {
  if (!process.env.VPC_ID_ELB) return;
  if (!process.env.VPC_ID_LAMBDA) return;

  detachElbToSubnet(process.env.VPC_ID_ELB, value);
  removeLambdaToSubnet(process.env.VPC_ID_LAMBDA, value);
  console.log('remove resource from subnet successfully.');
};

export const resumeResourcesInSubnet = async (value: string) => {
  if (!process.env.VPC_ID_ELB) return;
  if (!process.env.VPC_ID_LAMBDA) return;

  attachElbToSubnet(process.env.VPC_ID_ELB, value);
  addLambdaToSubnet(process.env.VPC_ID_LAMBDA, value);
  console.log('resume resource in subnet successfully.');
};
