export interface DeleteTheBookmarkOperation {
    type: 'DeleteTheBookmark',
    bookmarkURL: string,
    responseURL: string,
}

export interface SetANewURLOperation {
    type: 'SetANewURL',
    oldURL: string,
    newURL: string,
    responseURL: string,
}

export type Operation = DeleteTheBookmarkOperation | SetANewURLOperation;