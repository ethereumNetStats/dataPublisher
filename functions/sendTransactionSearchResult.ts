import { currentTimeReadable } from '@ethereum_net_stats/readable_time'
import { Server } from 'socket.io'
import { transactionSearchResult } from '../types/types'

const sendTransactionSearchResult = (
  transactionSearchResult: transactionSearchResult,
  dataPublisher: Server,
) => {
  console.log(
    `${currentTimeReadable()} | Receive : 'sendTransactionSearchResult' | From : socketServer`,
  )
  dataPublisher
    .to(transactionSearchResult.frontendId)
    .emit('sendTransactionSearchResult', transactionSearchResult)
  console.log(
    `${currentTimeReadable()} | Emit : 'sendTransactionSearchResult' | To : frontend | Id : ${
      transactionSearchResult.frontendId
    }`,
  )
}

export default sendTransactionSearchResult
