const cdk = require('aws-cdk-lib');
const ecs = require('aws-cdk-lib/aws-ecs');
const ec2 = require('aws-cdk-lib/aws-ec2');
const elbv2 = require('aws-cdk-lib/aws-elasticloadbalancingv2');

class HeraldTestStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
    });

    const cluster = new ecs.Cluster(this, 'MyCluster', {
      vpc,
    });

    const kibanaTaskDefinition = new ecs.FargateTaskDefinition(this, 'MyKibanaTaskDefinition');

    const kibanaContainer = kibanaTaskDefinition.addContainer('kibana', {
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/bitnami/kibana:8.6.2'),
      portMappings: [
        {
          containerPort: 5601,
          hostPort: 5601,
        }
      ],
    });

    const kibanaService = new ecs.FargateService(this, 'MyKibanaService', {
      cluster,
      taskDefinition: kibanaTaskDefinition,
      desiredCount: 1,
    });

    const esTaskDefinition = new ecs.FargateTaskDefinition(this, 'MyEsTaskDefinition');

    const esContainer = esTaskDefinition.addContainer('elasticsearch', {
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/bitnami/elasticsearch:8.6.2'),
      portMappings: [
        {
          containerPort: 9200,
          hostPort: 9200,
        }
      ],
    });

    const esService = new ecs.FargateService(this, 'MyEsService', {
      cluster,
      taskDefinition: esTaskDefinition,
      desiredCount: 1,
    });

    const alb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
      vpc,
      internetFacing: true,
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'KibanaTargetGroup', {
      vpc,
      protocol: 'HTTP',
      port: 80,
      targets: [kibanaService],
    });

    const listener = alb.addListener('MyListener', {
      port: 80,
      open: true,
      defaultTargetGroups: [targetGroup],
    });
  }
}

module.exports = { HeraldTestStack };
