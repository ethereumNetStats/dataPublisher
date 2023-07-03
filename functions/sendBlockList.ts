import { currentTimeReadable } from '@ethereum_net_stats/readable_time'
import { Server } from 'socket.io'
import { blockList, blockListTypeWithoutFrontendId } from '../types/types'

const sendBlockList = async (blockList: blockList, dataPublisher: Server) => {
  console.log(`${currentTimeReadable()} | Receive : 'sendBlockList' | From : socketServer`)

  // データプールサーバーから受け取ったブロックリストからフロントエンドIDを取り出す
  let frontendId: string = blockList.frontendId
  // ブロックリストからフロントエンドIDを削除するために型を変換
  let blockListWithoutFrontendId: blockListTypeWithoutFrontendId = blockList

  // 要求したユーザーのフロントエンドに結果を転送
  dataPublisher.to(frontendId).emit(`sendBlockList`, blockListWithoutFrontendId)
  console.log(`${currentTimeReadable()} | Emit : 'sendBlockList' | To frontend : ID ${frontendId}`)
}

export default sendBlockList
