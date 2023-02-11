// データベースの各集計データを格納するテーブルの型定義
type basicNetStats = {
    startTimeReadable: string,
    endTimeReadable: string,
    startTimeUnix: number,
    endTimeUnix: number,
    actualStartTimeUnix: number,
    actualEndTimeUnix: number,
    startBlockNumber: number,
    endBlockNumber: number,
    blocks: number,
    totalBlockSize: number,
    averageBlockSize: number,
    blockSizePerBlock: number,
    totalDifficulty: string,
    averageDifficulty: string,
    difficultyPerBlock: string,
    totalUncleDifficulty: string,
    averageUncleDifficulty: string,
    uncleDifficultyPerBlock: string,
    totalNumberOfUncleBlocks: number,
    averageNumberOfUncleBlocks: number,
    numberOfUncleBlocksPerBlock: number,
    hashRate: number,
    totalTransactions: number,
    averageTransactions: number,
    transactionsPerBlock: number,
    totalBaseFeePerGas: number,
    averageBaseFeePerGas: number,
    baseFeePerGasPerBlock: number,
    totalGasUsed: number,
    averageGasUsed: number,
    gasUsedPerBlock: number,
    noRecordFlag: boolean,
};

// イーサリアムアドレスのアドレス数のカウントデータの型定義
type numberOfAddresses = {
    startTimeReadable: string,
    endTimeReadable: string,
    startTimeUnix: number,
    endTimeUnix: number,
    numberOfAddress?: number,
    noRecordFlag: boolean,
};

// データベースの'blockData'テーブルの型定義
type blockData = {
    number: number,
    hash: string,
    parentHash: string,
    baseFeePerGas: number,
    nonce: string,
    sha3Uncles: string,
    logsBloom: string,
    transactionsRoot: string,
    miner: string,
    difficulty: string,
    totalDifficulty: string,
    extraData: string,
    size: number,
    gasLimit: number,
    gasUsed: number,
    timestamp: number,
    transactions: string,
    uncles: string,
    mixHash: string,
    receiptsRoot: string,
    timestampReadable?: string,
}

// 上記blockDataの配列型を定義
type blockDataArray = Array<blockData>;

// 各集計データにアドレスのカウント数を合わせたデータ型の定義
type netStats = basicNetStats & Pick<numberOfAddresses, "numberOfAddress">;

// netStatsを時系列で格納するための配列型を定義
type netStatsArray = Array<netStats>;

// socket.ioクライアントのIDを格納する配列型の定義
type frontends = Array<string>;

// ユーザーがブロックナンバーをクリックまたは入力して詳細を要求するときのイベントのデータ型の定義
type requestBlockDetail = {
    number: number,
    frontendId: string,
}

// ユーザーが"Block list"ページを要求した時、または当該ページのページ番号をクリックした時のイベント'requestBlockList'のデータ型の定義
type requestBlockList = {
    pageOffset: number,
    frontendId: string,
}

// ユーザーがブロックナンバーをクリックまたは入力した時の検索を要求するイベント'requestBlockDetail'のデータ型の定義
type responseBlockDetail = Pick<requestBlockDetail, "frontendId"> & blockData & {
    noRecord: boolean,
};

// 'requestBlockList'に対する応答イベントのデータ型の定義
type responseBlockList = {
    list: Array<blockData>,
    latestBlockNumber: number,
    totalPage: number,
    currentPage: number,
    topBlockNumber: number,
    lastBlockNumber: number,
    itemsPerPage: number,
    pageOffset: number,
    frontendId: string,
}

// ユーザーがブロックナンバーをクリックまたは入力した時のイベント'requestBlockListPageByBlockNumber'のデータ型の定義
type requestBlockListPageByBlockNumber = {
    blockNumber: number,
    frontendId: string,
};

// 'requestBlockListPageByBlockNumber'に対する応答イベントの型定義
type responseBlockListPageByBlockNumber = responseBlockList;

// transactionデータの型定義
type transactionDetail = {
    hash: string,
    nonce: number,
    blockHash: string | null,
    blockNumber: number | null,
    transactionIndex: number | null,
    from: string,
    to: string | null,
    input: string,
    value: string,
    gasPrice: string,
    gas: number,
    type?: number,
    v?: string,
    r?: string,
    s?: string,
    chainId?: string
}

// requestTransactionDetailのデータ型の定義
type requestTransactionDetail = {
    transactionHash: string,
    frontendId: string,
}

// responseTransactionDetailのデータ型の定義
type responseTransactionDetail = {
    transactionDetail?: transactionDetail
    frontendId: string,
    error: string,
}

export type {
    basicNetStats,
    netStatsArray,
    netStats,
    numberOfAddresses,
    blockData,
    blockDataArray,
    frontends,
    requestBlockDetail,
    responseBlockDetail,
    responseBlockList,
    requestBlockList,
    requestBlockListPageByBlockNumber,
    responseBlockListPageByBlockNumber,
    requestTransactionDetail,
    responseTransactionDetail
}
