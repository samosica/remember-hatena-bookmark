// TODO: chat_postMessage の第3引数に適切なテキストを与えることで，スマートフォンの通知欄にリマインドの内容が載るようにする

function remind() {
    const scriptProperties = PropertiesService.getScriptProperties();

    const nextIndex = parseInt(scriptProperties.getProperty('counter'), 10) + 1 || 1;
    const bookmark = getBookmark(nextIndex);
    const { text, blocks } = createReminderMessage(bookmark);

    const token = scriptProperties.getProperty('SLACK_ACCESS_TOKEN');
    const channel = scriptProperties.getProperty('SLACK_CHANNEL');
    chat_postMessage(token, channel, text, { blocks });

    console.info(`Posted a reminder message: ${nextIndex}`);

    scriptProperties.setProperty('counter', nextIndex.toString());
}
