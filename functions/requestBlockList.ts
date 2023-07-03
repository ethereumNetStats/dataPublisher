import { currentTimeReadable } from '@ethereum_net_stats/readable_time'
import { Socket } from 'socket.io-client'

const requestBlockList = async (
  pageOffset: number,
  frontendId: string,
  clientWithSocketServer: Socket,
) => {
  console.log(
    `${currentTimeReadable()} | Receive : 'requestBlockList' | From : frontend | Id : ${frontendId} | PageOffset : ${pageOffset}`,
  )
  // ユーザーの要求ページに当該ユーザーのフロントエンドIDを付加してデータプールサーバーに送信
  clientWithSocketServer.emit('requestBlockList', {
    pageOffset: pageOffset,
    frontendId: frontendId,
  })
  console.log(
    `${currentTimeReadable()} | Emit : 'requestBlockList' | To : socketServer | PageOffset : ${pageOffset}`,
  )
}

export default requestBlockList
