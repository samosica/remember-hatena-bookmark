// TODO: ブックマーク先の URL が 404 だったときに再検索用の URL を表示する
// TODO: getBookmark のエラー処理（範囲外参照とか），この関数からブックマークが得られなかったときのエラー処理を書く

interface SimplifiedBookmark {
    title: string,
    url: string,
    date: Date,
    tags: string[],
}

/**
 * Get bookmark from a designated spreadsheet
 * @param index 
 */
function getBookmark(index: number): SimplifiedBookmark {
    const spreadsheetID = PropertiesService.getScriptProperties().getProperty('BOOKMARK_SPREADSHEET_ID');
    const spreadsheet = SpreadsheetApp.openById(spreadsheetID);
    const sheet = spreadsheet.getSheets()[0];
    const rawData = sheet.getSheetValues(index, 1, 1, 4)[0];

    return { title: rawData[0], url: rawData[1], date: new Date(rawData[2]), tags: rawData[3] };
}
