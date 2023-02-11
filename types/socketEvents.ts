// socket.ioイベントの定義に必要な型定義のインポート
import {
    netStats,
    netStatsArray,
    blockData,
    blockDataArray,
    requestBlockDetail,
    responseBlockDetail,
    responseBlockList, requestBlockList, requestBlockListPageByBlockNumber, responseBlockListPageByBlockNumber,
    requestTransactionDetail, responseTransactionDetail
} from "./types";

// データプールサーバーからデータパブリッシャーへエミットするイベント名とデータ型の定義
type dataPoolServerToDataPublisherEvents = {
    stillNoInitialMinutelyNetStats: () => void,
    stillNoInitialHourlyNetStats: () => void,
    stillNoInitialDailyNetStats: () => void,
    stillNoInitialWeeklyNetStats: () => void,
    stillNoInitialBlockData: () => void,

    initialMinutelyNetStats: (initialMinutelyNetStats: netStatsArray) => void,
    initialHourlyNetStats: (initialHourlyNetStats: netStatsArray) => void,
    initialDailyNetStats: (initialDailyNetStats: netStatsArray) => void,
    initialWeeklyNetStats: (initialWeeklyNetStats: netStatsArray) => void,
    initialBlockData: (initialBlockData: blockDataArray) => void,

    newMinutelyNetStats: (newMinutelyNetStats: netStats) => void,
    newHourlyNetStats: (newHourlyNetStats: netStats) => void,
    newDailyNetStats: (newDailyNetStats: netStats) => void,
    newWeeklyNetStats: (newWeeklyNetStats: netStats) => void,
    newBlockData: (newBlockData: blockData) => void,

    responseBlockDetail: (responseBlockDetail: responseBlockDetail) => void,
    responseBlockList: (responseBlockList: responseBlockList) => void,
    responseBlockListPageByBlockNumber: (responseBlockListPageByBlockNumber: responseBlockListPageByBlockNumber) => void,
    responseTransactionDetail: (responseTransactionDetail: responseTransactionDetail) => void,
}

// データパブリッシャーからデータプールサーバーへエミットするsocket.ioイベントのイベント名とデータ型の定義
type dataPublisherToDataPoolServerEvents = {
    requestInitialMinutelyNetStats: () => void,
    requestInitialHourlyNetStats: () => void,
    requestInitialDailyNetStats: () => void,
    requestInitialWeeklyNetStats: () => void,
    requestInitialBlockData: () => void,
    requestBlockDetail: (requestBlockDetail: requestBlockDetail) => void,
    requestBlockList: (requestBlockList: requestBlockList) => void,
    requestBlockListPageByBlockNumber: (requestBlockListPageByBlockNumber: requestBlockListPageByBlockNumber) => void,
    requestTransactionDetail: (requestTransactionDetail: requestTransactionDetail) => void,
}

// データパブリッシャーから各フロントエンドへエミットするsocket.ioイベントのイベント名とデータ型の定義
type dataPublisherToFrontendEvents = {
    initialMinutelyNetStatsToFrontend: (initialMinutelyNetStatsToFrontend: netStatsArray) => void,
    initialHourlyNetStatsToFrontend: (initialHourlyNetStatsToFrontend: netStatsArray) => void,
    initialDailyNetStatsToFrontend: (initialDailyNetStatsToFrontend: netStatsArray) => void,
    initialWeeklyNetStatsToFrontend: (initialWeeklyNetStatsToFrontend: netStatsArray) => void,
    initialBlockDataToFrontend: (initialBlockDataToFrontend: blockDataArray) => void,

    newMinutelyNetStats: (newMinutelyNetStats: netStats) => void,
    newHourlyNetStats: (newHourlyNetStats: netStats) => void,
    newDailyNetStats: (newDailyNetStats: netStats) => void,
    newWeeklyNetStats: (newWeeklyNetStats: netStats) => void,
    newBlockData: (newBlockData: blockData) => void,

    blockDetail: (blockData: blockData) => void,
    responseBlockList: (responseBlockList: responseBlockList) => void,
    responseBlockListPageByBlockNumber: (responseBlockListPageByBlockNumber: responseBlockListPageByBlockNumber) => void,
}

// 各フロントエンドからデータパブリッシャーへエミットされるsocket.ioイベントのイベント名とデータ型の定義
type frontendToDataPublisherEvents = {
    requestInitialMinutelyNetStats: () => void,
    requestInitialHourlyNetStats: () => void,
    requestInitialDailyNetStats: () => void,
    requestInitialWeeklyNetStats: () => void,

    requestBlockDetail: (number: number) => void,
    requestBlockList: (pageOffset: number) => void,
    requestBlockListPageByBlockNumber: (blockNumber: number) => void,
    requestTransactionDetail: (requestTransactionDetail: requestTransactionDetail) => void,
}

export type {
    dataPoolServerToDataPublisherEvents,
    dataPublisherToDataPoolServerEvents,
    dataPublisherToFrontendEvents,
    frontendToDataPublisherEvents
}
