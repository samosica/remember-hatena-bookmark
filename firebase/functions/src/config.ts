import * as functions from "firebase-functions";

interface Config {
    slack: {
        readonly signing_secret: string,
        readonly token: string,
    },
    hb: {
        readonly consumer_key: string,
        readonly consumer_secret: string,
        readonly access_token: string,
        readonly access_token_secret: string,
    },
}

const funConfig = functions.config();

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
export const config: Config = {
    slack: {
        signing_secret: funConfig.slack.signing_secret,
        token: funConfig.slack.token,
    },
    hb: {
        consumer_key: funConfig.hb.consumer_key,
        consumer_secret: funConfig.hb.consumer_secret,
        access_token: funConfig.hb.access_token,
        access_token_secret: funConfig.hb.access_token_secret,
    },
};
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */