# Apollo Engine on AWS with Serverless

## Getting Started

1. `npm install`
2. Generate an Apollo Engine API key from the [Engine Dashboard](https://engine.apollographql.com/).
3. Set your Engine API key in the `engineApiKey` field within the [`serverless.yml`](./serverless.yml#L12) file.
to named profile in your [shared AWS credentials](https://docs.aws.amazon.com/cli/latest/topic/config-vars.html#the-shared-credentials-file).  You probably have this set already, but make sure it's the right one!
4. Pick a deployment model by picking one of the config options in the `resources` section at the bottom of `serverless.yml`.
    1. A basic deployment (selected by default)
    2. A Memcache-backed deployment (comment the basic deployment line and uncomment `engine-with-cache.yml`).
5. Ensure your AWS credentials are available in your environment.
   * Since Serverless uses standard AWS protocol behind the scenes, this means ensuring that both `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in your environment, or the `AWS_PROFILE` environment variable which points 
6. `npm run deploy`

## Deployment

Updates to the resolvers on already deployed stacks generally take a matter of seconds, but the initial deployment can take some time (about 5-10 minutes) as AWS provisions and deploys services.  This includes network infrastructure, Elastic Container Service clusters and the Docker containers themselves.

## Cleaning up

1. **Careful!** Run `npm run rip` to remove the entire deployment.  This is great for quickly launching a deployment for experimentation and thoroughly cleaning it up!
