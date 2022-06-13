import * as functions from "firebase-functions";
import * as pubsub from "@google-cloud/pubsub";
import * as hatenaBookmark from "hatena-bookmark-api";
import axios from "axios";
import { moveBookmark, getPageTitle } from "./util";
import { createReminderMessage } from "./message";
import { App, BlockButtonAction, ExpressReceiver } from "@slack/bolt";
import { createSetANewURLModal } from "./modal";
import { Operation, DeleteTheBookmarkOperation, SetANewURLOperation } from "./operation";
import { config } from "./config";

const receiver = new ExpressReceiver({
    signingSecret: config.slack.signing_secret,
    endpoints: '/events',
    processBeforeResponse: true, // FaaS-specific
});

const app = new App({
    receiver,
    token: config.slack.token,
});

app.error((e) => new Promise(() => {
    functions.logger.error(e.message);
}));

// If Delete the bookmark button in a message created by createReminderMessage is clicked,
app.action<BlockButtonAction>('delete_the_bookmark', async ({ body, ack, respond }) => {
    await ack();

    functions.logger.log('Received delete_the_bookmark action');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value: { bookmark_url: string } = JSON.parse(body.actions[0].value);
    const operation: DeleteTheBookmarkOperation = {
        type: 'DeleteTheBookmark',
        bookmarkURL: value.bookmark_url,
        responseURL: body.response_url,
    };

    try {
        const pubSubClient = new pubsub.PubSub();
        const buffer = Buffer.from(JSON.stringify(operation));
        const messageId = await pubSubClient.topic('hatena-bookmark-topic').publish(buffer);
        functions.logger.log(`Published a message: ${messageId}`);
    } catch (e) {
        functions.logger.error('Received an error: ', e);
        await respond({
            text: 'Failed to process your request. Please try again.',
            replace_original: false,
        });
    }
});

// If Set a new URL button in a message created by createReminderMessage is clicked,
app.action<BlockButtonAction>('set_a_new_url', async ({ body, ack, client }) => {
    await ack();

    functions.logger.log('Received set_a_new_url action');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value: { bookmark_url: string } = JSON.parse(body.actions[0].value);

    try {
        const modal = createSetANewURLModal(body.trigger_id, value.bookmark_url, body.response_url);
        const result = await client.views.open(modal);

        functions.logger.log('Opened a modal: ', result);
    } catch (e) {
        functions.logger.error('Cannot open a modal: ', e);
    }
});

// If Set a new URL modal created by createSetANewURLModal is submitted,
app.view('set_a_new_url_modal', async ({ ack, view }) => {
    await ack();

    functions.logger.log('Submitted set_a_new_url_modal');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const privateMetadata: { old_url: string, response_url: string } = JSON.parse(view.private_metadata);
    const operation: SetANewURLOperation = {
        type: 'SetANewURL',
        oldURL: privateMetadata.old_url,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        newURL: view.state.values.plain_text_input.new_url.value,
        responseURL: privateMetadata.response_url,
    };

    try {
        const pubSubClient = new pubsub.PubSub();
        const buffer = Buffer.from(JSON.stringify(operation));
        const messageId = await pubSubClient.topic('hatena-bookmark-topic').publish(buffer);
        functions.logger.log(`Published a message: ${messageId}`);
    } catch (e) {
        functions.logger.error('Received an error: ', e);
        await axios.post(
            privateMetadata.response_url,
            {
                text: 'Failed to process your request. Please try again.',
                replace_original: false,
            }
        );
    }
});

export const slack = functions.region('asia-northeast2').https.onRequest(receiver.app);

// functions.pubsub.topic の引数は subscription 名ではなく，topic 名
export const processRequest = functions.region('asia-northeast2').pubsub.topic('hatena-bookmark-topic').onPublish(async (message, context) => {
    functions.logger.log('Process a request to operate bookmarks in Hatena Bookmark');

    const hbClient = new hatenaBookmark.Client({
        consumerKey: config.hb.consumer_key,
        consumerSecret: config.hb.consumer_secret,
        accessToken: config.hb.access_token,
        accessTokenSecret: config.hb.access_token_secret,
    });

    functions.logger.log(`Received a message: ${context.eventId}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const operation: Operation = message.json;

    try {
        switch (operation.type) {
            case 'DeleteTheBookmark': {
                const { bookmarkURL, responseURL } = operation;
                await hbClient.deleteBookmark({ url: bookmarkURL });
                functions.logger.log(`Deleted the bookmark: ${bookmarkURL}`);
                // Notify completion to the user
                await axios.post(
                    responseURL,
                    { text: 'ブックマークを削除しました', replace_original: false }
                );
                // Delete reminder
                await axios.post(
                    responseURL,
                    { delete_original: true }
                );
                break;
            }
            case 'SetANewURL': {
                const { oldURL, newURL, responseURL } = operation;
                const newBookmark = await moveBookmark(oldURL, newURL, hbClient);
                functions.logger.log(`Set a new URL: ${oldURL} ---> ${newURL}`);
                // Notify completion to the user
                await axios.post(
                    responseURL,
                    { text: 'ブックマークの URL を変更しました', replace_original: false }
                );
                // Update reminder
                const title = (await getPageTitle(newURL)) || 'Unknown title';
                const contents = await createReminderMessage({ title, url: newURL, date: new Date(), tags: newBookmark.tags });
                await axios.post(
                    responseURL,
                    { replace_original: true, ...contents }
                );
                break;
            }
            default: {
                break;
            }
        }
    } catch (e) {
        functions.logger.error('Received an error: ', e);
        await axios.post(
            operation.responseURL,
            {
                text: 'Failed to process your request. Please try again.',
                replace_original: false,
            }
        );
    }
});