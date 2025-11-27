'use client';

import { useEffect, useRef } from 'react';

interface SimpleAudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
  onClick: () => void;
}

export function SimpleAudioVisualizer({
  stream,
  isRecording,
  onClick,
}: SimpleAudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!stream || !isRecording) {
      cleanup();
      return;
    }

    startVisualization();

    return cleanup;
  }, [stream, isRecording]);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const startVisualization = async () => {
    if (!stream) return;

    try {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      draw();
    } catch (error) {
      console.error('Error starting visualization:', error);
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Get colors from CSS variables
    const styles = getComputedStyle(document.documentElement);
    const mainColor = styles.getPropertyValue('--main').trim();
    const bgColor = styles.getPropertyValue('--secondary-background').trim();

    const drawFrame = () => {
      if (!isRecording) return;

      animationFrameRef.current = requestAnimationFrame(drawFrame);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with contrasting background
      ctx.fillStyle = bgColor.startsWith('#') ? bgColor : `hsl(${bgColor})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / bufferLength;
      const centerY = canvas.height / 2;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(2, (dataArray[i] / 255) * (canvas.height / 2));
        const x = barWidth * i;

        // Use main color with opacity based on amplitude for high contrast
        const opacity = 0.4 + (dataArray[i] / 255) * 0.6;
        ctx.fillStyle = mainColor.startsWith('#')
          ? mainColor +
            Math.round(opacity * 255)
              .toString(16)
              .padStart(2, '0')
          : `hsl(${mainColor} / ${opacity})`;

        // Draw mirrored bars
        ctx.fillRect(x, centerY - barHeight, barWidth - 1, barHeight);
        ctx.fillRect(x, centerY, barWidth - 1, barHeight);
      }
    };

    drawFrame();
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={60}
      onClick={onClick}
      className="w-full h-full cursor-pointer"
      style={{ display: 'block' }}
    />
  );
}
