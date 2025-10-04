import { cn } from '@/lib/utils';

export interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
  avatar?: string;
}

export default function MessageBubble({ content, isUser, timestamp, avatar }: MessageBubbleProps) {
  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-white' : 'bg-secondary text-white'
        )}
      >
        {avatar ? (
          <img src={avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-sm font-medium">{isUser ? 'You' : 'AI'}</span>
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex max-w-[70%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-primary text-white rounded-br-sm'
              : 'bg-card-background border border-border rounded-bl-sm'
          )}
        >
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        </div>

        {timestamp && (
          <span className="mt-1 text-xs text-foreground/50">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
