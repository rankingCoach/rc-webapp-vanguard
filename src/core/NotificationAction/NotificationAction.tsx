/**
 * This path used to hold a byte-identical copy of the Notification action. It now re-exports the one the package root
 * exports (src/core/Notification/NotificationAction), so there is a single implementation.
 */
export type { NotificationActionProps } from '../Notification/NotificationAction/NotificationAction';
export { NotificationAction } from '../Notification/NotificationAction/NotificationAction';
