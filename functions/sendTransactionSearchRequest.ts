import { currentTimeReadable } from '@ethereum_net_stats/readable_time'

import type { requestTransactionSearch } from '../types/types'
import type { Socket } from 'socket.io-client'

const sendTransactionSearchRequest = (
  requestTransactionHash: string,
  frontendId: string,
  clientWithSocketServer: Socket,
) => {
  console.log(
    `${currentTimeReadable()} | Receive : 'requestTransactionDetail' | From: frontend | Id : ${frontendId} | To : dataPoolServer | Transaction hash : ${requestTransactionHash}`,
  )

  // リクエストオブジェクトを生成
  let requestTransactionSearch: requestTransactionSearch = {
    transactionHash: requestTransactionHash,
    frontendId: frontendId,
  }

  // リクエストオブジェクトをdataPoolServerに送信
  clientWithSocketServer.emit('requestTransactionSearch', requestTransactionSearch)
}

export default sendTransactionSearchRequest
