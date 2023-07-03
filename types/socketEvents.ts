// socket.ioイベントの定義に必要な型定義のインポート
import {
  netStats,
  netStatsArray,
  blockData,
  blockDataArray,
  requestBlockDetail,
  responseBlockDetail,
  requestBlockList,
  requestBlockListPageByBlockNumberType,
  responseBlockListPageByBlockNumber,
  requestTransactionSearch,
  responseLatestData,
  requestBlockSearch,
  resultOfBlockSearch,
  blockList,
  transactionSearchResult,
} from './types'

// ソケットサーバーからデータパブリッシャーへエミットするイベント名とデータ型の定義
type socketServerToDataPublisherEvents = {
  stillNoInitialMinutelyNetStats: () => void
  stillNoInitialHourlyNetStats: () => void
  stillNoInitialDailyNetStats: () => void
  stillNoInitialWeeklyNetStats: () => void
  stillNoInitialBlockData: () => void

  initialMinutelyNetStats: (initialMinutelyNetStats: netStatsArray) => void
  initialHourlyNetStats: (initialHourlyNetStats: netStatsArray) => void
  initialDailyNetStats: (initialDailyNetStats: netStatsArray) => void
  initialWeeklyNetStats: (initialWeeklyNetStats: netStatsArray) => void
  initialBlockData: (initialBlockData: blockDataArray) => void

  newMinutelyNetStats: (newMinutelyNetStats: netStats) => void
  newHourlyNetStats: (newHourlyNetStats: netStats) => void
  newDailyNetStats: (newDailyNetStats: netStats) => void
  newWeeklyNetStats: (newWeeklyNetStats: netStats) => void
  newBlockData: (newBlockData: blockData) => void

  responseBlockDetail: (responseBlockDetail: responseBlockDetail) => void
  sendBlockList: (sendBlockList: blockList) => void
  responseBlockListPageByBlockNumber: (
    responseBlockListPageByBlockNumber: responseBlockListPageByBlockNumber,
  ) => void
  sendTransactionSearchResult: (transactionSearchResult: transactionSearchResult) => void

  sendLatest10BlockData: (responseLatest10BlockData: responseLatestData) => void
  sendLatestOneBlockData: (responseLatestOneBlockData: responseLatestData) => void

  resultOfBlockSearch: (resultOfBlockSearch: resultOfBlockSearch) => void
}

// データパブリッシャーからソケットサーバーへエミットするsocket.ioイベントのイベント名とデータ型の定義
type dataPublisherToSocketServerEvents = {
  requestInitialMinutelyNetStats: () => void
  requestInitialHourlyNetStats: () => void
  requestInitialDailyNetStats: () => void
  requestInitialWeeklyNetStats: () => void

  requestInitialBlockData: () => void
  requestBlockDetail: (requestBlockDetail: requestBlockDetail) => void
  requestBlockList: (requestBlockList: requestBlockList) => void
  requestBlockListPageByBlockNumber: (
    requestBlockListPageByBlockNumber: requestBlockListPageByBlockNumberType,
  ) => void
  requestTransactionSearch: (requestTransactionDetail: requestTransactionSearch) => void

  requestLatest10BlockData: () => void
  requestBlockSearch: (requestBlockSearch: requestBlockSearch) => void
}

// データパブリッシャーから各フロントエンドへエミットするsocket.ioイベントのイベント名とデータ型の定義
type dataPublisherToFrontendEvents = {
  initialMinutelyNetStatsToFrontend: (initialMinutelyNetStatsToFrontend: netStatsArray) => void
  initialHourlyNetStatsToFrontend: (initialHourlyNetStatsToFrontend: netStatsArray) => void
  initialDailyNetStatsToFrontend: (initialDailyNetStatsToFrontend: netStatsArray) => void
  initialWeeklyNetStatsToFrontend: (initialWeeklyNetStatsToFrontend: netStatsArray) => void
  initialBlockDataToFrontend: (initialBlockDataToFrontend: blockDataArray) => void

  newMinutelyNetStats: (newMinutelyNetStats: netStats) => void
  newHourlyNetStats: (newHourlyNetStats: netStats) => void
  newDailyNetStats: (newDailyNetStats: netStats) => void
  newWeeklyNetStats: (newWeeklyNetStats: netStats) => void
  newBlockData: (newBlockData: blockData) => void

  blockDetail: (blockData: blockData) => void
  responseBlockList: (sendBlockList: blockList) => void
  responseBlockListPageByBlockNumber: (
    responseBlockListPageByBlockNumber: responseBlockListPageByBlockNumber,
  ) => void
  sendTransactionSearchResult: (transactionSearchResult: transactionSearchResult) => void
}

// 各フロントエンドからデータパブリッシャーへエミットされるsocket.ioイベントのイベント名とデータ型の定義
type frontendToDataPublisherEvents = {
  requestInitialMinutelyNetStats: () => void
  requestInitialHourlyNetStats: () => void
  requestInitialDailyNetStats: () => void
  requestInitialWeeklyNetStats: () => void

  requestBlockDetail: (number: number) => void
  requestBlockList: (pageOffset: number) => void
  requestBlockListPageByBlockNumber: (blockNumber: number) => void
  requestTransactionDetail: (requestTransactionDetail: requestTransactionSearch) => void
  requestBlockSearch: (blockNumber: number) => void
}

export type {
  socketServerToDataPublisherEvents,
  dataPublisherToSocketServerEvents,
  dataPublisherToFrontendEvents,
  frontendToDataPublisherEvents,
}
