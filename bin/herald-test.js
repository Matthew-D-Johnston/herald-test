#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { HeraldTestStack } = require('../lib/herald-test-stack');

const app = new cdk.App();
new HeraldTestStack(app, 'HeraldTestStack');
