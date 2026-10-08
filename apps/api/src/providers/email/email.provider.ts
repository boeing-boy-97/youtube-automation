export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface EmailProvider {
  readonly name: string;
  send(input: SendEmailInput): Promise<{ messageId: string }>;
}
