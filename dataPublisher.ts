// 環境変数のインポート
import 'dotenv/config'

// パッケージのインポート
import { io, Socket } from 'socket.io-client'
import { Server } from 'socket.io'
import fs from 'fs'
import https from 'https'

// 自作パッケージのインポート
import { currentTimeReadable } from '@ethereum_net_stats/readable_time'

// 型定義のインポート
import type {
  blockData,
  blockDataArray,
  netStats,
  netStatsArray,
  responseBlockDetail,
  requestTransactionSearch,
  latestBlockData,
  responseLatestData,
  transactionDetail,
  resultOfBlockSearch,
  blockList,
  transactionSearchResult,
  netStatsWithAttribute,
  attribute,
  basicNetStatsArray,
} from './types/types'

// socket.ioのイベント定義のインポート
import type {
  socketServerToDataPublisherEvents,
  dataPublisherToSocketServerEvents,
  dataPublisherToFrontendEvents,
  frontendToDataPublisherEvents,
} from './types/socketEvents'
import requestBlockList from './functions/requestBlockList.js'
import sendBlockList from './functions/sendBlockList.js'
import requestBlockListPageByBlockNumber from './functions/requestBlockListPageByBlockNumber.js'
import sendTransactionSearchRequest from './functions/sendTransactionSearchRequest.js'
import sendTransactionSearchResult from './functions/sendTransactionSearchResult.js'

// 各集計データを格納する変数の初期化
// let minutelyNetStats: netStatsArray = []
let hourlyNetStats: netStatsArray = []
let dailyNetStats: netStatsArray = []
let weeklyNetStats: netStatsArray = []

// フロントエンドの"Latest blocks"セクションに表示するデータを格納する変数の初期化
let blockDataArray: blockDataArray = []

// フロントエンド（HorizonUI版）のトップページに表示するブロックデータを格納する変数の初期化
// responseLatestDataのlatestBlockDataを格納するための変数
let latest10BlockData: latestBlockData

// フロントエンド(HorizonUI版)のトップページに表示するトランザクションデータを格納する変数の初期化
// responseLatestDataのlatestTransactionDataを格納するための変数
// responseLatestData型のlatestTransactionDataプロパティはオプショナルなので、undefinedを型定義に含める
let latest10TransactionData: Array<transactionDetail> | undefined

// データパブリッシャーのsocket.ioクライアント名の定義
const clientName: string = 'dataPublisher'

// netStatsのattributeを格納する配列を定義
// これによりsocketイベントのエミットとリスンの処理をまとめて記述できる
const netStatsAttributeArray: Array<attribute> = ['Minutely', 'Hourly', 'Daily', 'Weekly']

// 各時間レンジのネットワークステータスを格納するオブジェクトの定義
let netStatsWithAttribute: netStatsWithAttribute = {}

// データプールサーバーとの通信に使用するsocket.ioクライアントの起動
const clientWithSocketServer: Socket<
  socketServerToDataPublisherEvents,
  dataPublisherToSocketServerEvents
> = io(`${process.env.SOCKET_SERVER_ADDRESS}`, {
  forceNew: true,
  query: {
    name: clientName,
    attribute: 'dataPublisher',
  },
})

//
// ソケットサーバーと通信するためのsocket.ioイベントハンドラーの登録
//

// ソケットサーバーとの接続確立時のイベントハンドラー
clientWithSocketServer.on('connect', () => {
  console.log(`${currentTimeReadable()} | Connect : socketServer`)

  // 各時間レンジのネットワークステータスの初期データをソケットサーバーにリクエスト
  netStatsAttributeArray.map((attribute) => {
    // @ts-ignore
    clientWithSocketServer.emit(`requestInitial${attribute}NetStats`)
    console.log(
      `${currentTimeReadable()} | Emit : 'requestInitial${attribute}NetStats' | To : socketServer`,
    )
  })

  // // データプールサーバーとの接続時に"Latest info"セクションの表示データの初期データをリクエスト
  // clientWithSocketServer.emit('requestInitialBlockData')
  // console.log(`${currentTimeReadable()} | Emit : 'requestInitialBlockData' | To : socketServer`)

  // ソケットサーバーとの接続時に'Latest info'セクションに表示する初期データをリクエスト
  clientWithSocketServer.emit('requestLatest10BlockData')
  console.log(`${currentTimeReadable()} | Emit : 'requestLatest10BlockData' | To : socketServer`)
})

// ソケットサーバーから各時間レンジのネットワークステータスの初期データを受信したときのイベントハンドラー
netStatsAttributeArray.map((attribute) => {
  // @ts-ignore
  clientWithSocketServer.on(
    `initial${attribute}NetStats`,
    (initialNetStats: basicNetStatsArray) => {
      console.log(
        `${currentTimeReadable()} | Receive : 'initial${attribute}NetStats' | From : socketServer`,
      )
      // 各時間レンジのネットワークステータスの初期データを受信したときに、各時間レンジのネットワークステータスの変数に格納
      netStatsWithAttribute[attribute] = initialNetStats
    },
  )
})

// clientWithSocketServer.on('initialBlockData', (initialBlockData: blockDataArray) => {
//   console.log(`${currentTimeReadable()} | Receive : 'initialBlockData' | From : dataPoolServer`)
//   // 'Latest blocks'セクションの表示データの初期データを受け取ったときに'blockDataArray'として格納
//   blockDataArray = initialBlockData
// })

// １分ごとの集計データの最新値を送信するイベント'newMinutelyNetStats'を受け取った時の処理
clientWithSocketServer.on('newMinutelyNetStats', (newMinutelyNetStats: netStats) => {
  console.log(`${currentTimeReadable()} | Receive : 'newMinutelyNetStats' | From : socketServer`)
  if (netStatsWithAttribute['Minutely'] !== undefined) {
    if (netStatsWithAttribute['Minutely'].length !== 0) {
      console.log(`${currentTimeReadable()} | Update : 'minutelyNetStats'`)
      // ソケットサーバーから１分ごとの集計データを受け取っていたら最後の値を削除して、最新値を追加して更新
      netStatsWithAttribute['Minutely'] = [
        ...netStatsWithAttribute['Minutely'].slice(1),
        newMinutelyNetStats,
      ]
      // 受け取った最新値をフロントエンドに転送
      dataPublisher.emit('newMinutelyNetStatsToFrontend', newMinutelyNetStats)
      console.log(
        `${currentTimeReadable()} | Emit : 'newMinutelyNetStatsToFrontend' | To : frontend`,
      )
    }
  }
})

// １時間ごとの集計データの最新値を送信するイベント'newMinutelyNetStats'を受け取った時の処理
clientWithSocketServer.on('newHourlyNetStats', (newHourlyNetStats: netStats) => {
  console.log(`${currentTimeReadable()} | Receive : 'newHourlyNetStats' | From : dataPoolServer`)
  if (hourlyNetStats.length !== 0) {
    // データプールサーバーから１時間ごとの集計データを受け取っていたら最後の値を削除して、最新値を追加して更新
    hourlyNetStats = [...hourlyNetStats.slice(1), newHourlyNetStats]

    // 受け取った最新値をフロントエンドに転送
    dataPublisher.emit('newHourlyNetStatsToFrontend', newHourlyNetStats)
    console.log(`${currentTimeReadable()} | Emit : 'newHourlyNetStatsToFrontend' | To : frontend`)
  }
})

clientWithSocketServer.on('newDailyNetStats', (newDailyNetStats: netStats) => {
  console.log(`${currentTimeReadable()} | Receive : 'newDailyNetStats | From : dataPoolServer`)
  if (dailyNetStats.length !== 0) {
    // データプールサーバーから１日ごとの集計データを受け取っていたら最後の値を削除して、最新値を追加して更新
    dailyNetStats = [...dailyNetStats.slice(1), newDailyNetStats]

    // 受け取った最新値をフロントエンドに転送
    dataPublisher.emit('newDailyNetStatsToFrontend', newDailyNetStats)
    console.log(`${currentTimeReadable()} | Emit : 'newDailyNetStatsToFrontend' | To : frontend`)
  }
})

clientWithSocketServer.on('newWeeklyNetStats', (newWeeklyNetStats: netStats) => {
  console.log(`${currentTimeReadable()} | Receive : 'newWeeklyNetStats' | From : dataPoolServer`)
  if (weeklyNetStats.length !== 0) {
    // データプールサーバーから１週間ごとの集計データを受け取っていたら最後の値を削除して、最新値を追加して更新
    weeklyNetStats = [...weeklyNetStats.slice(1), newWeeklyNetStats]

    // 受け取った最新値をフロントエンドに転送
    dataPublisher.emit('newWeeklyNetStatsToFrontend', newWeeklyNetStats)
    console.log(`${currentTimeReadable()} | Emit : 'newWeeklyNetStats' | To : Frontend`)
  }
})

clientWithSocketServer.on('newBlockData', (newBlockData: blockData) => {
  console.log(`${currentTimeReadable()} | Receive : 'newBlockData' | From : dataPoolServer`)
  if (blockDataArray.length !== 0) {
    // データプールサーバーから"Latest blocks"セクションの初期データを受け取っていたら最後の値を削除して、最新値を追加して更新
    blockDataArray = [newBlockData, ...blockDataArray.slice(0, -1)]

    // 受け取った最新値をフロントエンドに転送
    dataPublisher.emit('newBlockDataToFrontend', newBlockData)
    console.log(`${currentTimeReadable()} | Emit : 'newBlockData' | To : Frontend`)
  }
})

// ユーザーがブロックナンバーをクリックまたは入力したときの検索結果のデータを受け取るイベント'responseBlockDetail'の処理
clientWithSocketServer.on('responseBlockDetail', (responseBlockDetail: responseBlockDetail) => {
  console.log(
    `${currentTimeReadable()} | Receive : 'responseBlockDetail' | From : dataPoolServer | frontendId : ${
      responseBlockDetail.frontendId
    } | noRecord : ${responseBlockDetail.noRecord}`,
  )
  // 検索を要求したユーザーのフロントエンドに検索結果を転送
  dataPublisher.to(responseBlockDetail.frontendId).emit('responseBlockDetail', responseBlockDetail)
  console.log(
    `${currentTimeReadable()} | Emit : 'responseBlockDetail' | To : ${
      responseBlockDetail.frontendId
    } | noRecord : ${responseBlockDetail.noRecord}`,
  )
})

// Blockセクションを選択した時のイベントに対応する応答イベント
// Blockセクションでブロックナンバーを入力した時のイベントに対応する応答イベント
clientWithSocketServer.on('sendBlockList', (blockList: blockList) =>
  sendBlockList(blockList, dataPublisher),
)

// トランザクション検索の結果を受け取るイベント'responseTransactionDetail'の処理
clientWithSocketServer.on(
  'sendTransactionSearchResult',
  (transactionSearchResult: transactionSearchResult) =>
    sendTransactionSearchResult(transactionSearchResult, dataPublisher),
)

// socketServerと接続した時に受け取るsendLatest10Dataイベントの処理
clientWithSocketServer.on(
  'sendLatest10BlockData',
  (responseLatest10BlockData: responseLatestData) => {
    console.log(
      `${currentTimeReadable()} | Receive : 'sendLatest10BlockData' | From : socketServer`,
    )
    // 受け取ったデータをグローバル変数に格納
    latest10BlockData = responseLatest10BlockData.latestBlockData
    latest10TransactionData = responseLatest10BlockData.latestTransactionData
  },
)

clientWithSocketServer.on('sendLatestOneBlockData', (latestOneBlockData) => {
  console.log(`${currentTimeReadable()} | Receive : 'sendLatestOneBlockData' | From : socketServer`)
  // 配列latest10BlockData.latestDataの最後の値を削除して、最新値を追加して更新
  // 配列latest10BlockData.latestData[0]が一番古いデータになる
  if (latest10BlockData !== undefined) {
    latest10BlockData = [...latest10BlockData.slice(1), latestOneBlockData.latestBlockData[0]]
  }

  // 配列latest10TransactionData.latestDataの最後の値を削除して、最新値を追加して更新
  // 配列latest10TransactionData.latestData[0]が一番古いデータになる
  if (latest10TransactionData !== undefined) {
    if (latestOneBlockData.latestTransactionData !== undefined) {
      latest10TransactionData = [
        ...latest10TransactionData.slice(1),
        latestOneBlockData.latestTransactionData[0],
      ]
    }
  }

  // 受け取ったlatestOneBlockDataをフロントエンドに転送
  dataPublisher.emit('sendLatestOneBlockData', latestOneBlockData)
  console.log(`${currentTimeReadable()} | Emit : 'sendLatestOneBlockData' | To : Frontend`)
})

// resultOfBlockSearchイベントの処理
clientWithSocketServer.on('resultOfBlockSearch', (resultOfBlockSearch: resultOfBlockSearch) => {
  console.log(`${currentTimeReadable()} | Receive : 'resultOfBlockSearch' | From : dataPoolServer`)

  // フロントエンドに送信するためにresultOfBlockSearchからフロントエンドIDを削除したオブジェクトを生成
  const {
    frontendId: {},
    ...resultOfBlockSearchWithoutFrontendId
  } = resultOfBlockSearch

  // フロントエンドに転送
  dataPublisher
    .to(resultOfBlockSearch.frontendId)
    .emit('resultOfBlockSearch', resultOfBlockSearchWithoutFrontendId)
})

// ユーザーのフロントエンドと通信するためのSSL証明書を使用するHTTPサーバーオブジェクトの生成
const httpsServer = https.createServer({
  key: fs.readFileSync(`${process.env.SSL_CERTIFICATION_PRIVKEY}`),
  cert: fs.readFileSync(`${process.env.SSL_CERTIFICATION_CERT}`),
  ca: fs.readFileSync(`${process.env.SSL_CERTIFICATION_CHAIN}`),
})

// 上記HTTPサーバーを利用してsocket.ioサーバーを起動
const dataPublisher: Server = new Server<
  frontendToDataPublisherEvents,
  dataPublisherToFrontendEvents
>(httpsServer, {
  cors: {
    origin: '*',
  },
})

// ユーザーのフロントエンドのIDを格納する配列の初期化
// let frontends: frontends = [];

dataPublisher.on('connect', (frontend) => {
  console.log(`${currentTimeReadable()} | Connect : frontend`)

  // 各時間レンジのネットワークステータスの初期値をフロントエンドから要求された時の処理
  netStatsAttributeArray.map((attribute) => {
    frontend.on(`requestInitial${attribute}NetStats`, () => {
      console.log(
        `${currentTimeReadable()} | Receive : requestInitial${attribute}NetStats | From : frontend(ID : ${
          frontend.id
        })`,
      )
    })

    if (netStatsWithAttribute[attribute]?.length !== 0) {
      frontend.emit(`sendInitial${attribute}NetStats`, netStatsWithAttribute[attribute], () => {
        console.log(
          `${currentTimeReadable()} | Emit : sendInitial${attribute}NetStats | To : frontend(ID : ${
            frontend.id
          })`,
        )
      })
    }
  })

  // "Latest blocks"セクションの表示データの要求イベント'requestInitialBlockData'をフロントエンドから受け取った時の処理
  frontend.on('requestInitialBlockData', () => {
    console.log(`${currentTimeReadable()} | Receive : 'requestInitialBlockData | From : frontend'`)
    if (blockDataArray.length !== 0) {
      // 該当データをデータプールサーバーから受け取っていたらそのデータをフロントエンドに送信
      frontend.emit('initialBlockDataToFrontend', blockDataArray)
      console.log(`${currentTimeReadable()} | Emit : 'initialBlockDataToFrontend' | To : frontend`)
    }
  })

  // ユーザーがブロックナンバーをクリックまたは入力した時の検索を要求するイベント'requestBlockDetail'を受け取った時の処理
  frontend.on('requestBlockDetail', (number: number) => {
    console.log(
      `${currentTimeReadable()} | Receive : 'requestBlockDetail' | From : ${
        frontend.id
      } | blockNumber : ${number}`,
    )
    // ユーザーが要求するブロックナンバーに当該ユーザーのフロントエンドIDを付加してデータプールサーバーに送信
    clientWithSocketServer.emit('requestBlockDetail', { number: number, frontendId: frontend.id })
    console.log(
      `${currentTimeReadable()} | Emit : 'requestBlockDetail' | To : dataPoolServer | FrontendId : ${
        frontend.id
      }`,
    )
  })

  // ユーザーが"Block list"ページを要求した時、または当該ページのページ番号をクリックした時のイベント'requestBlockList'を受け取った時の処理
  frontend.on(
    'requestBlockList',
    async (pageOffset: number) =>
      await requestBlockList(pageOffset, frontend.id, clientWithSocketServer),
  )

  // ユーザーがブロックナンバーをクリックまたは入力した時のイベント'requestBlockListPageByBlockNumber'の処理
  frontend.on('requestBlockListPageByBlockNumber', (blockNumber: number) =>
    requestBlockListPageByBlockNumber(blockNumber, frontend.id, clientWithSocketServer),
  )

  // ユーザーがトランザクションハッシュを検索する時のイベント'requestTransactionDetail'の処理
  frontend.on('requestTransactionSearch', (requestTransactionHash: string) =>
    sendTransactionSearchRequest(requestTransactionHash, frontend.id, clientWithSocketServer),
  )

  // 新たなフロントエンド（ユーザー）がアクセスした時に送られるイベント'requestLatest10BlockDataを受け取った時の処理
  // latest10BlockDataをフロントエンドに返信
  frontend.on('requestLatest10BlockData', () => {
    console.log(`${currentTimeReadable()} | Receive : 'requestLatest10BlockData' | From : frontend`)
    if (latest10BlockData !== undefined && latest10BlockData.length !== 0) {
      let latest10Data: responseLatestData = {
        latestBlockData: latest10BlockData,
        latestTransactionData: latest10TransactionData,
      }
      frontend.emit('sendLatest10BlockData', latest10Data)
      console.log(`${currentTimeReadable()} | Emit : 'sendLatest10BlockData' | To : frontend`)
    } else {
      frontend.emit('noLatest10BlockData')
      console.log(`${currentTimeReadable()} | Emit : 'noLatest10BlockData' | To : frontend`)
    }
  })

  // ユーザーがブロックナンバーを入力した時のイベント'requestBlockSearch'の処理
  frontend.on('requestBlockSearch', (blockNumber: number) => {
    console.log(`${currentTimeReadable()} | Receive : 'requestBlockSearch' | From : frontend`)
    // ユーザーが要求するブロックナンバーに当該ユーザーのフロントエンドIDを付加してデータプールサーバーに送信
    clientWithSocketServer.emit('requestBlockSearch', {
      blockNumber: blockNumber,
      frontendId: frontend.id,
    })
    console.log(`${currentTimeReadable()} | Emit : 'requestBlockSearch' | To : socketServer`)
  })

  // フロントエンドとの接続が切断された時の処理
  frontend.on('disconnect', () => {
    console.log(`${currentTimeReadable()} | Disconnect from a frontend`)
    // サーバー側から明示的に切断
    frontend.disconnect()
  })
})

// ポート8443でリスニング開始
httpsServer.listen(8443)
