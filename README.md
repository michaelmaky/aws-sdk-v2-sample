# Run Function

```
yarn start {module} {function}={parameter}
```

e.g.

```
yarn start ssm removeResourcesFromSubnet=subnet-b

yarn start ssm getParametersByPath=/,false

yarn start ssm exportParametersToJSON

yarn start lambda getFunctions

yarn start lambda exportFunctionsToJSON

```

# env template

AWS_REGION=ap-southeast-1
AWS_PROFILE=default
AWS_PROXY_URL=
VPC_ID_ELB=vpc-1234567
VPC_ID_LAMBDA=vpc-1234567
LAMBDA_NAME=LambdaAPI
SSM_PREFIX=prefix_you_want
SSM_REMOVE_PREFIX=true
