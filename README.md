# Apollo Engine on AWS with Serverless

## Getting Started

1. `npm install`
2. Generatae an Apollo Engine API key from the [Engine Dashboard](https://engine.apollographql.com/).
3. Set your Engine API key in the `engineApiKey` field within the [`serverless.yml`](./serverless.yml#L12) file.
4. Ensure your AWS credentials are available in your environment.
   * Since Serverless uses standard AWS protocol behind the scenes, this means ensuring that both `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set in your environment, or the `AWS_PROFILE` environment variable which points to named profile in your [shared AWS credentials](https://docs.aws.amazon.com/cli/latest/topic/config-vars.html#the-shared-credentials-file).  You probably have this set already, but make sure it's the right one!
5. `npm run deploy`

## Cleaning up

1. **Careful!** Run `npm run rip` to remove the entire deployment.  This is great for quickly launching a deployment for experimentation!
