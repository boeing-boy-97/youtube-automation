import { Resend } from 'resend';
import { env } from '../../../config/env.js';
import { ProviderError } from '../../../common/errors/app-error.js';
import type { EmailProvider, SendEmailInput } from '../email.provider.js';

export class ResendEmailProvider implements EmailProvider {
  readonly name = 'resend';
  private client: Resend;

  constructor() {
    if (!env.RESEND_API_KEY) throw new ProviderError('RESEND_API_KEY is not configured');
    this.client = new Resend(env.RESEND_API_KEY);
  }

  async send(input: SendEmailInput) {
    try {
      const from = input.from || env.EMAIL_FROM;
      if (!from) throw new ProviderError('EMAIL_FROM is not configured');
      if (!input.html && !input.text) {
        input = { ...input, text: ' ' };
      }
      const res = await this.client.emails.send({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html || input.text || ' ',
        text: input.text,
        replyTo: input.replyTo,
        tags: input.tags ? Object.entries(input.tags).map(([name, value]) => ({ name, value })) : undefined,
      });
      if (res.error) throw new ProviderError(`Resend error: ${res.error.message}`, { cause: res.error });
      return { messageId: String((res.data as any)?.id || '') };
    } catch (err) {
      if (err instanceof ProviderError) throw err;
      throw new ProviderError('Email send failed', { cause: err });
    }
  }
}
