import { prisma } from '../../database/prisma.js';
import { newId } from '../../common/utils/ids.js';
import { getEmail } from '../../providers/email/index.js';

export interface NotificationInput {
  workspaceId: string;
  userId?: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'APPROVAL_REQUESTED' | 'PUBLISH_SUCCEEDED' | 'PUBLISH_FAILED' | 'QC_WARNING' | 'DAILY_SUMMARY' | 'SYSTEM';
  title: string;
  body?: string;
  link?: string;
  data?: Record<string, unknown>;
  email?: boolean;
  toEmail?: string;
}

export async function createNotification(input: NotificationInput) {
  const n = await prisma.notification.create({
    data: {
      id: newId('ntf'),
      userId: input.userId,
      workspaceId: input.workspaceId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      data: input.data as any,
    },
  });
  if (input.email && input.toEmail) {
    try {
      const email = getEmail();
      await email.send({ to: input.toEmail, subject: input.title, text: input.body, html: input.body ? `<p>${escapeHtml(input.body)}</p>` : undefined });
      await prisma.notification.update({ where: { id: n.id }, data: { emailedAt: new Date() } });
    } catch (err) {
      // email failure should not lose in-app notification
    }
  }
  return n;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
