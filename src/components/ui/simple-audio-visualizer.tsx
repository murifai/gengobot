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
  const animationFrameRef = useRef<number>();

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

    const drawFrame = () => {
      if (!isRecording) return;

      animationFrameRef.current = requestAnimationFrame(drawFrame);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with white background
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / bufferLength;
      const centerY = canvas.height / 2;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height / 2);
        const x = barWidth * i;

        // Primary color with opacity based on amplitude
        const opacity = 0.3 + (dataArray[i] / 255) * 0.7;
        ctx.fillStyle = `rgba(0, 122, 255, ${opacity})`; // iOS-style primary blue

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
