// 環境変数のインポート
import "dotenv/config";

// パッケージのインポート
import {io, Socket} from "socket.io-client";
import {Server} from "socket.io";
import fs from "fs";
import https from 'https';

// 自作パッケージのインポート
import {currentTimeReadable} from "@ethereum_net_stats/readable_time";

// 型定義のインポート
import type {
    blockData,
    blockDataArray,
    netStats,
    netStatsArray,
    frontends,
    responseBlockList,
    responseBlockDetail, requestBlockListPageByBlockNumber, responseBlockListPageByBlockNumber
} from "./types/types";

// socket.ioのイベント定義のインポート
import type {
    dataPoolServerToDataPublisherEvents,
    dataPublisherToDataPoolServerEvents,
    dataPublisherToFrontendEvents,
    frontendToDataPublisherEvents
} from "./types/socketEvents";

// 各集計データを格納する変数の初期化
let minutelyNetStats: netStatsArray = [];
let hourlyNetStats: netStatsArray = [];
let dailyNetStats: netStatsArray = [];
let weeklyNetStats: netStatsArray = [];

// フロントエンドの"Latest blocks"セクションに表示するデータを格納する変数の初期化
let blockDataArray: blockDataArray = [];

// データパブリッシャーのsocket.ioクライアント名の定義
const clientName: string = 'dataPublisher';

// データプールサーバーとの通信に使用するsocket.ioクライアントの起動
const clientToDataPoolServer: Socket<dataPoolServerToDataPublisherEvents, dataPublisherToDataPoolServerEvents> = io(`${process.env.DATAPOOL_SERVER_LAN_ADDRESS}`, {
    forceNew: true,
    query: {
        name: clientName,
    }
});

//
// データプールサーバーと通信するためのsocket.ioイベントハンドラーの登録
//

clientToDataPoolServer.on('connect', () => {
    console.log(`${currentTimeReadable()} | Connect : dataPoolServer`);

    // データプールサーバーとの接続時に各集計データの初期データをリクエスト
    clientToDataPoolServer.emit('requestInitialMinutelyNetStats');
    console.log(`${currentTimeReadable()} | Emit : 'requestInitialMinutelyNetStats' | To : dataPoolServer`);
    clientToDataPoolServer.emit('requestInitialHourlyNetStats');
    console.log(`${currentTimeReadable()} | Emit : 'requestInitialHourlyNetStats' | To : dataPoolServer`);
    clientToDataPoolServer.emit('requestInitialDailyNetStats');
    console.log(`${currentTimeReadable()} | Emit : 'requestInitialDailyNetStats' | To : dataPoolServer`);
    clientToDataPoolServer.emit('requestInitialWeeklyNetStats');
    console.log(`${currentTimeReadable()} | Emit : 'requestInitialWeeklyNetStats' | To : dataPoolServer`);

    // データプールサーバーとの接続時に"Latest blocks"セクションの表示データの初期データをリクエスト
    clientToDataPoolServer.emit('requestInitialBlockData');
    console.log(`${currentTimeReadable()} | Emit : 'requestInitialBlockData' | To : dataPoolServer`);
});

clientToDataPoolServer.on('stillNoInitialMinutelyNetStats', () => {
    console.log(`${currentTimeReadable()} | No data : The dataPoolServer does not have the initial minutely net stats yet.`);
    // データプールサーバーが１分ごとの集計データをバックエンドから受け取っていない場合のイベント"stillNoInitialMinutelyNetStats"を
    // 受け取ったときには、２秒後に初期データを再リクエスト
    setTimeout(() => {
        clientToDataPoolServer.emit('requestInitialMinutelyNetStats');
        console.log(`${currentTimeReadable()} | Re-emit : 'requestInitialMinutelyNetStats' | To : dataPoolServer`);
    }, 2000);
});

clientToDataPoolServer.on('stillNoInitialHourlyNetStats', () => {
    console.log(`${currentTimeReadable()} | No data : The dataPoolServer does not have the initial hourly net stats yet.`);
    // データプールサーバーが１時間ごとの集計データをバックエンドから受け取っていない場合のイベント"stillNoInitialHourlyNetStats"を
    // 受け取ったときには、２秒後に初期データを再リクエスト
    setTimeout(() => {
        clientToDataPoolServer.emit('requestInitialHourlyNetStats');
        console.log(`${currentTimeReadable()} | Re-emit : 'requestInitialHourlyNetStats' | To : dataPoolServer`);
    }, 2000);
});

clientToDataPoolServer.on('stillNoInitialDailyNetStats', () => {
    console.log(`${currentTimeReadable()} | No data : The dataPoolServer does not have the initial daily net stats yet.`);
    // データプールサーバーが１日ごとの集計データをバックエンドから受け取っていない場合のイベント"stillNoInitialDailyNetStats"を
    // 受け取ったときには、２秒後に初期データを再リクエスト
    setTimeout(() => {
        clientToDataPoolServer.emit('requestInitialDailyNetStats');
        console.log(`${currentTimeReadable()} | Re-emit : 'requestInitialDailyNetStats' | To : dataPoolServer`);
    }, 2000);
});

clientToDataPoolServer.on('stillNoInitialWeeklyNetStats', () => {
    console.log(`${currentTimeReadable()} | No data : The dataPoolServer does not have the initial weekly net stats yet.`);
    // データプールサーバーが１週間ごとの集計データをバックエンドから受け取っていない場合のイベント"stillNoInitialWeeklyNetStats"を
    // 受け取ったときには、２秒後に初期データを再リクエスト
    setTimeout(() => {
        clientToDataPoolServer.emit('requestInitialWeeklyNetStats');
        console.log(`${currentTimeReadable()} | Re-emit : 'requestInitialWeeklyNetStats' | To : dataPoolServer`);
    }, 2000);
});

clientToDataPoolServer.on('stillNoInitialBlockData', () => {
    console.log(`${currentTimeReadable()} | No data : The dataPoolServer does not have the initial block data yet.`);
    // データプールサーバーが"Latest blocks"セクション用のデータをバックエンドから受け取っていない場合のイベント"stillNoInitialBlockData"を
    // 受け取ったときには、２秒後に初期データを再リクエスト
    setTimeout(() => {
        clientToDataPoolServer.emit('requestInitialBlockData');
        console.log(`${currentTimeReadable()} | Re-emit : 'requestInitialBlockData' | To : dataPoolServer`);
    }, 2000);
});

clientToDataPoolServer.on('initialMinutelyNetStats', (initialMinutelyNetStats: netStatsArray) => {
    console.log(`${currentTimeReadable()} | Receive : 'initialMinutelyNetStats' | From : dataPoolServer`);
    // １分ごとの集計データの初期データを受け取ったときに'minutelyNetStats'として格納
    minutelyNetStats = initialMinutelyNetStats;
});

clientToDataPoolServer.on('initialHourlyNetStats', (initialHourlyNetStats: netStatsArray) => {
    console.log(`${currentTimeReadable()} | Receive : 'initialHourlyNetStats' | From : dataPoolServer`);
    // １時間ごとの集計データの初期データを受け取ったときに'hourlyNetStats'として格納
    hourlyNetStats = initialHourlyNetStats;
});

clientToDataPoolServer.on('initialDailyNetStats', (initialDailyNetStats: netStatsArray) => {
    console.log(`${currentTimeReadable()} | Receive : 'initialDailyNetStats' | From : dataPoolServer`);
    // １日ごとの集計データの初期データを受け取ったときに'dailyNetStats'として格納
    dailyNetStats = initialDailyNetStats;
});

clientToDataPoolServer.on('initialWeeklyNetStats', (initialWeeklyNetStats: netStatsArray) => {
    console.log(`${currentTimeReadable()} | Receive : 'initialWeeklyNetStats' | From : dataPoolServer`);
    // １週間ごとの集計データの初期データを受け取ったときに'weeklyNetStats'として格納
    weeklyNetStats = initialWeeklyNetStats;
});

clientToDataPoolServer.on('initialBlockData', (initialBlockData: blockDataArray) => {
    console.log(`${currentTimeReadable()} | Receive : 'initialBlockData' | From : dataPoolServer`);
    // 'Latest blocks'セクションの表示データの初期データを受け取ったときに'blockDataArray'として格納
    blockDataArray = initialBlockData;
})

// １分ごとの集計データの最新値を送信するイベント'newMinutelyNetStats'を受け取った時の処理
clientToDataPoolServer.on('newMinutelyNetStats', (newMinutelyNetStats: netStats) => {
        console.log(`${currentTimeReadable()} | Receive : 'newMinutelyNetStats' | From : dataPoolServer`);
    if (minutelyNetStats.length !== 0) {
        // データプールサーバーから１分ごとの集計データを受け取っていたら最後の値を削除して、最新値を追加して更新
        minutelyNetStats = [...minutelyNetStats.slice(1), newMinutelyNetStats];

        // 受け取った最新値をフロントエンドに転送
        dataPublisher.emit('newMinutelyNetStatsToFrontend', newMinutelyNetStats);
        console.log(`${currentTimeReadable()} | Emit : 'newMinutelyNetStatsToFrontend' | To : frontend`);
    }
});

// １時間ごとの集計データの最新値を送信するイベント'newMinutelyNetStats'を受け取った時の処理
clientToDataPoolServer.on('newHourlyNetStats', (newHourlyNetStats: netStats) => {
    console.log(`${currentTimeReadable()} | Receive : 'newHourlyNetStats' | From : dataPoolServer`);
    if (hourlyNetStats.length !== 0) {
        // データプールサーバーから１時間ごとの集計データを受け取っていたら最後の値を削除して、最新値を追加して更新
        hourlyNetStats = [...hourlyNetStats.slice(1), newHourlyNetStats];

        // 受け取った最新値をフロントエンドに転送
        dataPublisher.emit('newHourlyNetStatsToFrontend', newHourlyNetStats);
        console.log(`${currentTimeReadable()} | Emit : 'newHourlyNetStatsToFrontend' | To : frontend`);
    }
});

clientToDataPoolServer.on('newDailyNetStats', (newDailyNetStats: netStats) => {
    console.log(`${currentTimeReadable()} | Receive : 'newDailyNetStats | From : dataPoolServer`);
    if (dailyNetStats.length !== 0) {
        // データプールサーバーから１日ごとの集計データを受け取っていたら最後の値を削除して、最新値を追加して更新
        dailyNetStats = [...dailyNetStats.slice(1), newDailyNetStats];

        // 受け取った最新値をフロントエンドに転送
        dataPublisher.emit('newDailyNetStatsToFrontend', newDailyNetStats);
        console.log(`${currentTimeReadable()} | Emit : 'newDailyNetStatsToFrontend' | To : frontend`);
    }
});

clientToDataPoolServer.on('newWeeklyNetStats', (newWeeklyNetStats: netStats) => {
    console.log(`${currentTimeReadable()} | Receive : 'newWeeklyNetStats' | From : dataPoolServer`);
    if (weeklyNetStats.length !== 0) {
        // データプールサーバーから１週間ごとの集計データを受け取っていたら最後の値を削除して、最新値を追加して更新
        weeklyNetStats = [...weeklyNetStats.slice(1), newWeeklyNetStats];

        // 受け取った最新値をフロントエンドに転送
        dataPublisher.emit('newWeeklyNetStatsToFrontend', newWeeklyNetStats);
        console.log(`${currentTimeReadable()} | Emit : 'newWeeklyNetStats' | To : Frontend`);
    }
});

clientToDataPoolServer.on('newBlockData', (newBlockData: blockData) => {
    console.log(`${currentTimeReadable()} | Receive : 'newBlockData' | From : dataPoolServer`);
    if (blockDataArray.length !== 0) {
        // データプールサーバーから"Latest blocks"セクションの初期データを受け取っていたら最後の値を削除して、最新値を追加して更新
        blockDataArray = [newBlockData, ...blockDataArray.slice(0, -1)];

        // 受け取った最新値をフロントエンドに転送
        dataPublisher.emit('newBlockDataToFrontend', newBlockData);
        console.log(`${currentTimeReadable()} | Emit : 'newBlockData' | To : Frontend`);
    }
});

// ユーザーがブロックナンバーをクリックまたは入力したときの検索結果のデータを受け取るイベント'responseBlockDetail'の処理
clientToDataPoolServer.on('responseBlockDetail', (responseBlockDetail: responseBlockDetail) => {
    console.log(`${currentTimeReadable()} | Receive : 'responseBlockDetail' | From : dataPoolServer | frontendId : ${responseBlockDetail.frontendId} | noRecord : ${responseBlockDetail.noRecord}`);
    // 検索を要求したユーザーのフロントエンドに検索結果を転送
    dataPublisher.to(responseBlockDetail.frontendId).emit('responseBlockDetail', responseBlockDetail);
    console.log(`${currentTimeReadable()} | Emit : 'responseBlockDetail' | To : ${responseBlockDetail.frontendId} | noRecord : ${responseBlockDetail.noRecord}`);
});

// ユーザーが"Block list"ページを要求した時の初期データを受け取るイベント'responseBlockList'の処理
clientToDataPoolServer.on('responseBlockList', (responseBlockList: responseBlockList) => {
    console.log(`${currentTimeReadable()} | Receive : 'responseBlockList' | From : dataPoolServer`);
    // 要求したユーザーのフロントエンドに結果を転送
    dataPublisher.to(responseBlockList.frontendId).emit(`responseBlockList`, responseBlockList);
    console.log(`${currentTimeReadable()} | Emit : 'responseBlockList' | To : ${responseBlockList.frontendId}`);
});

// ユーザーが"Block list"ページでページ番号をクリックまたは入力した時の検索結果を受け取るイベント'responseBlockListPageByBlockNumber'の処理
clientToDataPoolServer.on('responseBlockListPageByBlockNumber', (responseBlockListPageByBlockNumber: responseBlockListPageByBlockNumber) => {
    console.log(`${currentTimeReadable()} | Receive : 'responseBlockListPageByBlockNumber' | From : dataPoolServer`);
    // 検索を要求したユーザーのフロントエンドに結果を転送
    dataPublisher.to(responseBlockListPageByBlockNumber.frontendId).emit('responseBlockListPageByBlockNumber', responseBlockListPageByBlockNumber);
    console.log(`${currentTimeReadable()} | Emit : 'responseBlockListPageByBlockNumber' | From : frontend | Id : ${responseBlockListPageByBlockNumber.frontendId}`);
});

// ユーザーのフロントエンドと通信するためのSSL証明書を使用するHTTPサーバーオブジェクトの生成
const httpsServer = https.createServer({
    key: fs.readFileSync(`${process.env.SSL_CERTIFICATION_PRIVKEY}`),
    cert: fs.readFileSync(`${process.env.SSL_CERTIFICATION_CERT}`),
    ca: fs.readFileSync(`${process.env.SSL_CERTIFICATION_CHAIN}`),
})

// 上記HTTPサーバーを利用してsocket.ioサーバーを起動
const dataPublisher: Server = new Server<frontendToDataPublisherEvents, dataPublisherToFrontendEvents>(httpsServer, {
    cors: {
        origin: '*',
    }
});

// ユーザーのフロントエンドのIDを格納する配列の初期化
let frontends: frontends = [];

dataPublisher.on('connect', (frontend) => {
    console.log(`${currentTimeReadable()} | Connect : frontend`);

    // 新たなユーザーからの接続があった場合にそのIDを配列に追加
    frontends.push(frontend.id);

    // １分ごとの集計データの初期データの要求イベント'requestInitialMinutelyNetStats'をフロントエンドから受け取った時の処理
    frontend.on('requestInitialMinutelyNetStats', () => {
        console.log(`${currentTimeReadable()} | Receive : 'requestInitialMinutelyNetStats' | From : frontend`);
        if (minutelyNetStats.length !== 0) {
            // １分ごとの集計データをデータプールサーバーから受け取っていたらそのデータをフロントエンドに送信
            frontend.emit('initialMinutelyNetStatsToFrontend', minutelyNetStats, () => {
                console.log(`${currentTimeReadable()} | Emit : initialMinutelyNetStatsToFrontend | To : frontend`);
            });
        }
    });

    // １時間ごとの集計データの初期データの要求イベント'requestInitialMinutelyNetStats'をフロントエンドから受け取った時の処理
    frontend.on('requestInitialHourlyNetStats', () => {
        console.log(`${currentTimeReadable()} | Receive : 'requestInitialHourlyNetStats' | From : frontend`);
        if (hourlyNetStats.length !== 0) {
            // １時間ごとの集計データをデータプールサーバーから受け取っていたらそのデータをフロントエンドに送信
            frontend.emit('initialHourlyNetStatsToFrontend', hourlyNetStats);
            console.log(`${currentTimeReadable()} | Emit : 'initialHourlyNetStatsToFrontend' | To : frontend`);
        }
    });

    // １日ごとの集計データの初期データの要求イベント'requestInitialMinutelyNetStats'をフロントエンドから受け取った時の処理
    frontend.on('requestInitialDailyNetStats', () => {
        console.log(`${currentTimeReadable()} | Receive : 'requestInitialDailyNetStats' | From : frontend`);
        if (dailyNetStats.length !== 0) {
            // １日ごとの集計データをデータプールサーバーから受け取っていたらそのデータをフロントエンドに送信
            frontend.emit('initialDailyNetStatsToFrontend', dailyNetStats);
            console.log(`${currentTimeReadable()} | Emit : 'initialDailyNetStatsToFrontend' | To : frontend`);
        }
    });

    // １週間ごとの集計データの初期データの要求イベント'requestInitialMinutelyNetStats'をフロントエンドから受け取った時の処理
    frontend.on('requestInitialWeeklyNetStats', () => {
        console.log(`${currentTimeReadable()} | Receive : 'requestInitialWeeklyNetStats' | From : frontend`);
        if (weeklyNetStats.length !== 0) {
            // １週間ごとの集計データをデータプールサーバーから受け取っていたらそのデータをフロントエンドに送信
            frontend.emit('initialWeeklyNetStatsToFrontend', weeklyNetStats);
            console.log(`${currentTimeReadable()} | Emit : 'initialWeeklyNetStatsToFrontend | To : frontend`);
        }
    });

    // "Latest blocks"セクションの表示データの要求イベント'requestInitialBlockData'をフロントエンドから受け取った時の処理
    frontend.on('requestInitialBlockData', () => {
        console.log(`${currentTimeReadable()} | Receive : 'requestInitialBlockData | From : frontend'`);
        if (blockDataArray.length !== 0) {
            // 該当データをデータプールサーバーから受け取っていたらそのデータをフロントエンドに送信
            frontend.emit('initialBlockDataToFrontend', blockDataArray);
            console.log(`${currentTimeReadable()} | Emit : 'initialBlockDataToFrontend' | To : frontend`);
        }
    });

    // ユーザーがブロックナンバーをクリックまたは入力した時の検索を要求するイベント'requestBlockDetail'を受け取った時の処理
    frontend.on('requestBlockDetail', (number: number) => {
        console.log(`${currentTimeReadable()} | Receive : 'requestBlockDetail' | From : ${frontend.id} | blockNumber : ${number}`);
        // ユーザーが要求するブロックナンバーに当該ユーザーのフロントエンドIDを付加してデータプールサーバーに送信
        clientToDataPoolServer.emit('requestBlockDetail', ({number: number, frontendId: frontend.id}));
        console.log(`${currentTimeReadable()} | Emit : 'requestBlockDetail' | To : dataPoolServer | FrontendId : ${frontend.id}`);
    });

    // ユーザーが"Block list"ページを要求した時、または当該ページのページ番号をクリックした時のイベント'requestBlockList'を受け取った時の処理
    frontend.on('requestBlockList', (pageOffset: number) => {
        console.log(`${currentTimeReadable()} | Receive : 'requestBlockList' | From : frontend | Id : ${frontend.id} | PageOffset : ${pageOffset}`);
        // ユーザーの要求ページに当該ユーザーのフロントエンドIDを付加してデータプールサーバーに送信
        clientToDataPoolServer.emit('requestBlockList', ({pageOffset: pageOffset, frontendId: frontend.id}));
        console.log(`${currentTimeReadable()} | Emit : 'requestBlockList' | To : dataPoolServer | PageOffset : ${pageOffset}`);
    });

    // ユーザーがブロックナンバーをクリックまたは入力した時のイベント'requestBlockListPageByBlockNumber'の処理
    frontend.on('requestBlockListPageByBlockNumber', (blockNumber: number) => {
        console.log(`${currentTimeReadable()} | Receive : 'requestBlockListPageByNumber | From : frontend | Id : ${frontend.id}`);
        // ユーザーの要求するブロックナンバーに当該ユーザーのフロントエンドIDを付加してデータプールサーバーに転送
        clientToDataPoolServer.emit('requestBlockListPageByBlockNumber', {blockNumber: blockNumber, frontendId: frontend.id});
        console.log(`${currentTimeReadable()} | Emit : 'requestBlockListPageByNumber | To : dataPoolServer`);
    });

    // フロントエンドとの接続が切断された時の処理
    frontend.on('disconnect', () => {
        console.log(`${currentTimeReadable()} | Disconnect from a frontend`);
        // サーバー側から明示的に切断
        frontend.disconnect();
    });
});

// ポート8443でリスニング開始
httpsServer.listen(8443);
