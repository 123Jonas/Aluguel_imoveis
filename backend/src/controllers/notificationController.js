const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getUserNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort('-createdAt')
    .limit(50);

  res.status(200).json({ status: 'success', results: notifications.length, data: { notifications } });
});

exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
  res.status(200).json({ status: 'success', data: { count } });
});

exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) return next(new AppError('Notificação não encontrada.', 404));
  res.status(200).json({ status: 'success', data: { notification } });
});

exports.markAllNotificationsAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.status(200).json({ status: 'success', message: 'Todas as notificações foram marcadas como lidas' });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  if (!notification) return next(new AppError('Notificação não encontrada.', 404));
  res.status(204).json({ status: 'success', data: null });
});

exports.deleteAllNotifications = catchAsync(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  res.status(204).json({ status: 'success', data: null });
});
