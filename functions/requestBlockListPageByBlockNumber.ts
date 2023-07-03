import { currentTimeReadable } from '@ethereum_net_stats/readable_time'
import { Socket } from 'socket.io-client'

const requestBlockListPageByBlockNumber = (
  blockNumber: number,
  frontendId: string,
  clientWithSocketServer: Socket,
) => {
  console.log(
    `${currentTimeReadable()} | Receive : 'requestBlockListPageByNumber' | From : frontend | Id : ${frontendId}`,
  )
  // ユーザーが要求するブロックナンバーに当該ユーザーのフロントエンドIDを付加してデータプールサーバーに転送
  clientWithSocketServer.emit('requestBlockListPageByBlockNumber', {
    blockNumber: blockNumber,
    frontendId: frontendId,
  })
  console.log(
    `${currentTimeReadable()} | Emit : 'requestBlockListPageByNumber' | To : socketServer`,
  )
}

export default requestBlockListPageByBlockNumber
