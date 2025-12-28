'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface JLPTErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showGoHome?: boolean;
  className?: string;
}

export function JLPTErrorState({
  title = 'エラーが発生しました',
  message = '問題が発生しました。もう一度お試しください。',
  error,
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = false,
  className,
}: JLPTErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>

      <p className="text-muted-foreground max-w-md mb-1">{message}</p>

      {errorMessage && (
        <div className="mt-2 p-3 bg-muted rounded-lg max-w-md">
          <p className="text-xs text-muted-foreground font-mono break-words">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {showGoHome && onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            ホームに戻る
          </Button>
        )}

        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </Button>
        )}
      </div>
    </div>
  );
}

export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <JLPTErrorState
      title="接続エラー"
      message="インターネット接続を確認して、もう一度お試しください。"
      onRetry={onRetry}
      showRetry={!!onRetry}
    />
  );
}

export function NotFoundErrorState({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <JLPTErrorState
      title="ページが見つかりません"
      message="お探しのページは存在しないか、移動した可能性があります。"
      onGoHome={onGoHome}
      showRetry={false}
      showGoHome={!!onGoHome}
    />
  );
}

export function SessionExpiredErrorState({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <JLPTErrorState
      title="セッションの有効期限切れ"
      message="セッションの有効期限が切れました。ホームに戻って新しいテストを開始してください。"
      onGoHome={onGoHome}
      showRetry={false}
      showGoHome={!!onGoHome}
    />
  );
}
