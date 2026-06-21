const Notification = require('../models/Notification');
const User = require('../models/User');
const Rental = require('../models/Rental');

class NotificationService {
  static async createNotification(data) {
    try {
      console.log('Criando notificação:', data);
      
      const notification = new Notification({
        recipient: data.recipient,
        sender: data.sender,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedEntity: data.relatedEntity,
        relatedEntityType: data.relatedEntityType
      });

      const savedNotification = await notification.save();
      console.log('Notificação criada com sucesso:', savedNotification);
      
      return savedNotification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw new Error('Erro ao criar notificação: ' + error.message);
    }
  }

  static async sendRentalRequestNotification(property, tenant, landlord) {
    const message = `Novo pedido de arrendamento para o imóvel ${property.title}`;
    
    await this.createNotification({
      recipient: landlord._id,
      sender: tenant._id,
      type: 'rental_request',
      message,
      relatedProperty: property._id
    });
  }

  static async sendRentalResponseNotification(rental, tenant, landlord, approved) {
    const message = approved
      ? `Seu pedido de arrendamento para o imóvel ${rental.property.title} foi aprovado!`
      : `Seu pedido de arrendamento para o imóvel ${rental.property.title} foi rejeitado.`;

    await this.createNotification({
      recipient: tenant._id,
      sender: landlord._id,
      type: approved ? 'rental_approved' : 'rental_rejected',
      message,
      relatedProperty: rental.property._id,
      relatedRental: rental._id
    });
  }

  static async getUserNotifications(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name')
        .populate('relatedProperty', 'title')
        .populate('relatedRental');

      const total = await Notification.countDocuments({ recipient: userId });

      return {
        notifications,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notificações: ${error.message}`);
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      console.log('Marcando notificação como lida:', notificationId);
      
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notificação não encontrada');
      }

      console.log('Notificação marcada como lida:', notification);
      return notification;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw new Error('Erro ao marcar notificação como lida: ' + error.message);
    }
  }

  static async markAllAsRead(userId) {
    try {
      console.log('Marcando todas as notificações como lidas para o usuário:', userId);
      
      const result = await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
      );

      console.log('Notificações marcadas como lidas:', result);
      return result;
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw new Error('Erro ao marcar todas as notificações como lidas: ' + error.message);
    }
  }

  static async deleteNotification(notificationId) {
    try {
      console.log('Deletando notificação:', notificationId);
      
      const notification = await Notification.findByIdAndDelete(notificationId);

      if (!notification) {
        throw new Error('Notificação não encontrada');
      }

      console.log('Notificação deletada com sucesso');
      return notification;
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      throw new Error('Erro ao deletar notificação: ' + error.message);
    }
  }

  static async getUnreadCount(userId) {
    try {
      console.log('Contando notificações não lidas para o usuário:', userId);
      
      const count = await Notification.countDocuments({
        recipient: userId,
        read: false
      });

      console.log(`Número de notificações não lidas: ${count}`);
      return count;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      throw new Error('Erro ao contar notificações não lidas: ' + error.message);
    }
  }

  static async sendRentalCancellationNotification(rental, tenant, landlord) {
    try {
      await this.createNotification({
        recipient: landlord._id,
        sender: tenant._id,
        type: 'rental_cancellation',
        title: 'Cancelamento de aluguel',
        message: `${tenant.name} cancelou a solicitação de aluguel da propriedade`,
        relatedRental: rental._id
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de cancelamento de aluguel:', error);
      throw error;
    }
  }

  static async sendRentalEndNotification(rental, tenant, landlord) {
    try {
      await this.createNotification({
        recipient: landlord._id,
        sender: tenant._id,
        type: 'rental_end',
        title: 'Término de aluguel',
        message: `O aluguel da propriedade por ${tenant.name} está chegando ao fim`,
        relatedRental: rental._id
      });

      await this.createNotification({
        recipient: tenant._id,
        sender: landlord._id,
        type: 'rental_end',
        title: 'Término de aluguel',
        message: 'Seu período de aluguel está chegando ao fim',
        relatedRental: rental._id
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de término de aluguel:', error);
      throw error;
    }
  }

  static async sendPropertyUpdateNotification(property, landlord) {
    try {
      const activeRentals = await Rental.find({
        property: property._id,
        status: 'active'
      }).populate('tenant');

      for (const rental of activeRentals) {
        await this.createNotification({
          recipient: rental.tenant._id,
          sender: landlord._id,
          type: 'property_update',
          title: 'Atualização de propriedade',
          message: `A propriedade que você aluga foi atualizada por ${landlord.name}`,
          relatedRental: rental._id
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de atualização de propriedade:', error);
      throw error;
    }
  }

  static async sendMaintenanceNotification(property, landlord, maintenance) {
    try {
      const activeRentals = await Rental.find({
        property: property._id,
        status: 'active'
      }).populate('tenant');

      for (const rental of activeRentals) {
        await this.createNotification({
          recipient: rental.tenant._id,
          sender: landlord._id,
          type: 'maintenance',
          title: 'Manutenção programada',
          message: `${landlord.name} programou uma manutenção: ${maintenance.description}`,
          relatedRental: rental._id
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de manutenção:', error);
      throw error;
    }
  }

  static async sendMessageNotification(sender, receiver, message) {
    try {
      await this.createNotification({
        recipient: receiver._id,
        sender: sender._id,
        type: 'message',
        title: 'Nova mensagem',
        message: `${sender.name} enviou uma mensagem: ${message.substring(0, 50)}...`
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de mensagem:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 