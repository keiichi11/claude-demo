/**
 * VoiceButton Component - Voice recording button with visual feedback
 */

import { Mic, Square } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui';

export interface VoiceButtonProps {
  isRecording: boolean;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceButton({
  isRecording,
  disabled,
  onStart,
  onStop,
}: VoiceButtonProps) {
  return (
    <Button
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      variant={isRecording ? 'danger' : 'secondary'}
      size="lg"
      className={clsx(
        'min-w-[64px]',
        isRecording && 'animate-pulse shadow-lg shadow-red-500/50'
      )}
      aria-label={isRecording ? '録音停止' : '音声入力'}
      aria-live="polite"
    >
      {isRecording ? (
        <>
          <Square className="h-5 w-5 mr-2" />
          停止
        </>
      ) : (
        <>
          <Mic className="h-5 w-5 mr-2" />
          音声
        </>
      )}
    </Button>
  );
}
