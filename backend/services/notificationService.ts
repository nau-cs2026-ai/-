import { messagesRepository } from '../repositories/messages';
import { InsertMessage } from '../db/schema';

export class NotificationService {
  static async sendApprovalNotification(
    sellerId: string,
    productId: string,
    productTitle: string
  ) {
    try {
      const systemMessage = await messagesRepository.create({
        senderId: 'system',
        receiverId: sellerId,
        productId,
        content: `🎉 您的商品"${productTitle}"已通过审核，现在可以正常展示了！`,
        messageType: 'system',
      } as InsertMessage);
      return systemMessage;
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }
  }

  static async sendRejectionNotification(
    sellerId: string,
    productId: string,
    productTitle: string,
    reason: string
  ) {
    try {
      const systemMessage = await messagesRepository.create({
        senderId: 'system',
        receiverId: sellerId,
        productId,
        content: `❌ 您的商品"${productTitle}"未通过审核。原因：${reason}。您可以修改后重新提交。`,
        messageType: 'system',
      } as InsertMessage);
      return systemMessage;
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }
  }

  static async sendBatchApprovalNotification(
    sellerIds: string[],
    productCount: number
  ) {
    try {
      for (const sellerId of sellerIds) {
        await messagesRepository.create({
          senderId: 'system',
          receiverId: sellerId,
          content: `🎉 您有 ${productCount} 个商品已通过审核，现在可以正常展示了！`,
          messageType: 'system',
        } as InsertMessage);
      }
    } catch (error) {
      console.error('Failed to send batch approval notification:', error);
    }
  }

  static async sendBatchRejectionNotification(
    sellerIds: string[],
    productCount: number,
    reason: string
  ) {
    try {
      for (const sellerId of sellerIds) {
        await messagesRepository.create({
          senderId: 'system',
          receiverId: sellerId,
          content: `❌ 您有 ${productCount} 个商品未通过审核。原因：${reason}。您可以修改后重新提交。`,
          messageType: 'system',
        } as InsertMessage);
      }
    } catch (error) {
      console.error('Failed to send batch rejection notification:', error);
    }
  }
}

export default NotificationService;
