// Deprecated functions using incoming webhook
// Usage:
// const OPTIONS = {'channel': '#notification', 'username': 'Remember Hatena Bookmark', 'icon_emoji': ':question:'};
// sendMessageToSlack(WEB_HOOK_URI, text, OPTIONS);
function sendMessageToSlack(webHookURI, message, options = {}) {
    const data = { 'text': message, ...options };
    const payload = JSON.stringify(data);
    const params = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': payload
    };
    // @ts-ignore
    UrlFetchApp.fetch(webHookURI, params);
}

function sendRichMessageToSlack(webHookURI, blocks, options = {}) {
    const data = { ...blocks, ...options };
    const payload = JSON.stringify(data);
    const params = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': payload
    };
    // @ts-ignore
    UrlFetchApp.fetch(webHookURI, params);
}

/**
 * Post a message to a channel
 * @param token 
 * @param channel 
 * @param text 
 * @param options See https://api.slack.com/methods/chat.postMessage
 */
function chat_postMessage(token: string, channel: string, text: string, options = {}) {
    const args = { channel, text, ...options };
    const payload = JSON.stringify(args);
    UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
        method: 'post',
        headers: {
            Authorization: `Bearer ${token}`
        },
        contentType: 'application/json; charset=UTF-8',
        payload,
    });
}