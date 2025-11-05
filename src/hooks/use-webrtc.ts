'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Tool } from '@/types/conversation';

/**
 * The return type for the hook
 */
interface UseWebRTCAudioSessionReturn {
  status: string;
  isSessionActive: boolean;
  audioIndicatorRef: React.RefObject<HTMLDivElement | null>;
  startSession: () => Promise<void>;
  stopSession: () => void;
  handleStartStopClick: () => void;
  commitAudioBuffer: () => void;
  registerFunction: (name: string, fn: (...args: unknown[]) => unknown) => void;
  msgs: unknown[];
  currentVolume: number;
  conversation: Conversation[];
  sendTextMessage: (text: string) => void;
}

/**
 * Hook to manage a real-time session with OpenAI's Realtime endpoints.
 */
export default function useWebRTCAudioSession(
  voice: string,
  tools?: Tool[]
): UseWebRTCAudioSessionReturn {
  // Connection/session states
  const [status, setStatus] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Audio references for local mic
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // WebRTC references
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Keep track of all raw events/messages
  const [msgs, setMsgs] = useState<unknown[]>([]);

  // Main conversation state
  const [conversation, setConversation] = useState<Conversation[]>([]);

  // For function calls (AI "tools")
  const functionRegistry = useRef<Record<string, (...args: unknown[]) => unknown>>({});

  // Volume analysis (assistant inbound audio)
  const [currentVolume, setCurrentVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  /**
   * We track only the ephemeral user message **ID** here.
   * While user is speaking, we update that conversation item by ID.
   */
  const ephemeralUserMessageIdRef = useRef<string | null>(null);

  /**
   * Register a function (tool) so the AI can call it.
   */
  function registerFunction(name: string, fn: (...args: unknown[]) => unknown) {
    functionRegistry.current[name] = fn;
  }

  /**
   * Configure the data channel on open, sending a session update to the server.
   */
  function configureDataChannel(dataChannel: RTCDataChannel) {
    // Send session update with server VAD enabled for transcription
    const sessionUpdate: {
      type: string;
      session: {
        modalities: string[];
        tools?: Tool[];
        input_audio_transcription?: {
          model: string;
        };
        turn_detection?: {
          type: string;
          threshold: number;
          prefix_padding_ms: number;
          silence_duration_ms: number;
        };
      };
    } = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        input_audio_transcription: {
          model: 'whisper-1',
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 700,
        },
      },
    };

    // Only include tools if they exist and are not empty
    if (tools && tools.length > 0) {
      sessionUpdate.session.tools = tools;
    }

    dataChannel.send(JSON.stringify(sessionUpdate));

    console.log('Session update sent:', sessionUpdate);
  }

  /**
   * Return an ephemeral user ID, creating a new ephemeral message in conversation if needed.
   */
  function getOrCreateEphemeralUserId(): string {
    let ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) {
      // Use uuidv4 for a robust unique ID
      ephemeralId = uuidv4();
      ephemeralUserMessageIdRef.current = ephemeralId;

      const newMessage: Conversation = {
        id: ephemeralId,
        role: 'user',
        text: '',
        timestamp: new Date().toISOString(),
        isFinal: false,
        status: 'speaking',
      };

      // Append the ephemeral item to conversation
      setConversation(prev => [...prev, newMessage]);
    }
    return ephemeralId;
  }

  /**
   * Update the ephemeral user message (by ephemeralUserMessageIdRef) with partial changes.
   */
  function updateEphemeralUserMessage(partial: Partial<Conversation>) {
    const ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) return; // no ephemeral user message to update

    setConversation(prev =>
      prev.map(msg => {
        if (msg.id === ephemeralId) {
          return { ...msg, ...partial };
        }
        return msg;
      })
    );
  }

  /**
   * Clear ephemeral user message ID so the next user speech starts fresh.
   */
  function clearEphemeralUserMessage() {
    ephemeralUserMessageIdRef.current = null;
  }

  /**
   * Main data channel message handler: interprets events from the server.
   */
  async function handleDataChannelMessage(event: MessageEvent) {
    try {
      const msg = JSON.parse(event.data);
      console.log('Incoming dataChannel message:', msg.type, msg);

      switch (msg.type) {
        /**
         * Error handling
         */
        case 'error': {
          console.error('WebRTC error - full message:', msg);
          console.error('Error object:', msg.error);
          console.error('Error type:', typeof msg.error);
          console.error('Error keys:', msg.error ? Object.keys(msg.error) : 'no error object');

          const errorMessage =
            msg.error?.message || msg.message || msg.error_message || 'Unknown error';
          const errorCode = msg.error?.code || msg.code || '';
          const errorType = msg.error?.type || msg.type || '';
          const fullError = errorCode
            ? `[${errorCode}] ${errorMessage}`
            : errorType && errorType !== 'error'
              ? `[${errorType}] ${errorMessage}`
              : errorMessage;

          setStatus(`Error: ${fullError}`);
          console.error('Formatted error:', fullError);
          break;
        }

        /**
         * User speech started
         */
        case 'input_audio_buffer.speech_started': {
          getOrCreateEphemeralUserId();
          updateEphemeralUserMessage({ status: 'speaking' });
          break;
        }

        /**
         * User speech stopped
         */
        case 'input_audio_buffer.speech_stopped': {
          // optional: you could set "stopped" or just keep "speaking"
          updateEphemeralUserMessage({ status: 'speaking' });
          break;
        }

        /**
         * Audio buffer committed => request transcription
         */
        case 'input_audio_buffer.committed': {
          updateEphemeralUserMessage({
            text: 'Transcribing...',
            status: 'processing',
          });
          console.log('Audio committed, waiting for transcription events...');
          break;
        }

        /**
         * Partial user transcription (delta)
         */
        case 'conversation.item.input_audio_transcription.delta': {
          console.log('Transcription delta:', msg.delta);
          const ephemeralId = getOrCreateEphemeralUserId();

          setConversation(prev =>
            prev.map(convMsg => {
              if (convMsg.id === ephemeralId) {
                return {
                  ...convMsg,
                  text: (convMsg.text || '') + (msg.delta || ''),
                  status: 'speaking',
                  isFinal: false,
                };
              }
              return convMsg;
            })
          );
          break;
        }

        /**
         * Final user transcription - server VAD automatically triggers response
         */
        case 'conversation.item.input_audio_transcription.completed': {
          console.log('✅ Final user transcription event received:', msg);

          // Create a new final user message with the transcript
          const finalUserMessage: Conversation = {
            id: msg.item_id || uuidv4(),
            role: 'user',
            text: msg.transcript || '',
            timestamp: new Date().toISOString(),
            isFinal: true,
            status: 'final',
          };

          // Remove any ephemeral user messages and add the final one
          setConversation(prev => {
            const ephemeralId = ephemeralUserMessageIdRef.current;
            const filtered = ephemeralId ? prev.filter(m => m.id !== ephemeralId) : prev;
            return [...filtered, finalUserMessage];
          });

          clearEphemeralUserMessage();

          // Don't manually create response - server VAD handles it automatically
          break;
        }

        /**
         * Conversation item created - contains the finalized user input
         */
        case 'conversation.item.created': {
          console.log('conversation.item.created full details:', JSON.stringify(msg.item, null, 2));

          // Check if this is a user message with audio input
          if (msg.item?.role === 'user' && msg.item?.type === 'message') {
            console.log('User message detected, content:', msg.item.content);

            // Extract transcript from audio content
            const audioContent = msg.item.content?.find(
              (c: { type: string }) => c.type === 'input_audio'
            );

            console.log('Audio content found:', audioContent);

            if (audioContent) {
              if (audioContent.transcript) {
                console.log('User transcript from item.created:', audioContent.transcript);

                // Create a new final user message
                const finalUserMessage: Conversation = {
                  id: msg.item.id || uuidv4(),
                  role: 'user',
                  text: audioContent.transcript,
                  timestamp: new Date().toISOString(),
                  isFinal: true,
                  status: 'final',
                };

                // Remove any ephemeral user messages and add the final one
                setConversation(prev => {
                  const ephemeralId = ephemeralUserMessageIdRef.current;
                  const filtered = ephemeralId ? prev.filter(m => m.id !== ephemeralId) : prev;
                  return [...filtered, finalUserMessage];
                });

                clearEphemeralUserMessage();
              } else {
                console.warn(
                  'Transcript is null - transcription may not be enabled or still processing'
                );

                // Keep the ephemeral message showing "Processing speech..."
                // The transcript might come in a later event
              }
            }
          }
          break;
        }

        /**
         * Streaming AI transcripts (assistant partial) - skip for instant display
         */
        case 'response.audio_transcript.delta': {
          // Don't show streaming text - wait for complete transcript
          console.log('Skipping delta:', msg.delta);
          break;
        }

        /**
         * Response done - may contain user transcript in usage field
         */
        case 'response.done': {
          console.log('response.done event:', msg.response);
          console.log('response.done usage:', msg.response?.usage);

          // Try to extract user transcript from usage.input_audio_tokens or other fields
          if (msg.response?.usage?.input_audio_tokens) {
            console.log('Audio tokens detected in response');
          }

          // Log the full response structure to help debug
          console.log('Full response structure:', JSON.stringify(msg.response, null, 2));
          break;
        }

        /**
         * Complete AI transcript - display all at once
         */
        case 'response.audio_transcript.done': {
          console.log('Complete AI transcript:', msg.transcript);

          // Create a complete final message with the full transcript
          const assistantMessage: Conversation = {
            id: msg.item_id || uuidv4(),
            role: 'assistant',
            text: msg.transcript || '',
            timestamp: new Date().toISOString(),
            isFinal: true,
            status: 'final',
          };

          // Add the complete message
          setConversation(prev => {
            // Remove any partial assistant messages and add the complete one
            const filtered = prev.filter(m => !(m.role === 'assistant' && !m.isFinal));
            return [...filtered, assistantMessage];
          });
          break;
        }

        /**
         * AI calls a function (tool)
         */
        case 'response.function_call_arguments.done': {
          const fn = functionRegistry.current[msg.name];
          if (fn) {
            const args = JSON.parse(msg.arguments) as Record<string, unknown>;
            const result = await fn(args);

            // Respond with function output
            const response = {
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: msg.call_id,
                output: JSON.stringify(result),
              },
            };
            dataChannelRef.current?.send(JSON.stringify(response));

            const responseCreate = {
              type: 'response.create',
            };
            dataChannelRef.current?.send(JSON.stringify(responseCreate));
          }
          break;
        }

        default: {
          // console.warn("Unhandled message type:", msg.type);
          break;
        }
      }

      // Always log the raw message
      setMsgs(prevMsgs => [...prevMsgs, msg]);
      return msg;
    } catch (error) {
      console.error('Error handling data channel message:', error);
    }
  }

  /**
   * Fetch ephemeral token from your Next.js endpoint
   */
  async function getEphemeralToken() {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Failed to get ephemeral token: ${response.status}`);
      }
      const data = await response.json();
      return data.client_secret.value;
    } catch (err) {
      console.error('getEphemeralToken error:', err);
      throw err;
    }
  }

  /**
   * Sets up a local audio visualization for mic input (toggle wave CSS).
   */
  function setupAudioVisualization(stream: MediaStream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateIndicator = () => {
      if (!audioContext) return;
      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      // Toggle an "active" class if volume is above a threshold
      if (audioIndicatorRef.current) {
        audioIndicatorRef.current.classList.toggle('active', average > 30);
      }
      requestAnimationFrame(updateIndicator);
    };
    updateIndicator();

    audioContextRef.current = audioContext;
  }

  /**
   * Calculate RMS volume from inbound assistant audio
   */
  function getVolume(): number {
    if (!analyserRef.current) return 0;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const float = (dataArray[i] - 128) / 128;
      sum += float * float;
    }
    return Math.sqrt(sum / dataArray.length);
  }

  /**
   * Start a new session:
   */
  async function startSession() {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'getUserMedia is not available. Please use HTTPS or check browser compatibility.'
        );
      }

      setStatus('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setupAudioVisualization(stream);

      setStatus('Fetching ephemeral token...');
      const ephemeralToken = await getEphemeralToken();

      setStatus('Establishing connection...');
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Hidden <audio> element for inbound assistant TTS
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;

      // Inbound track => assistant's TTS
      pc.ontrack = event => {
        audioEl.srcObject = event.streams[0];

        // Optional: measure inbound volume
        const AudioContextClass =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioContextClass) return;
        const audioCtx = new AudioContextClass();
        const src = audioCtx.createMediaStreamSource(event.streams[0]);
        const inboundAnalyzer = audioCtx.createAnalyser();
        inboundAnalyzer.fftSize = 256;
        src.connect(inboundAnalyzer);
        analyserRef.current = inboundAnalyzer;

        // Start volume monitoring
        volumeIntervalRef.current = window.setInterval(() => {
          setCurrentVolume(getVolume());
        }, 100);
      };

      // Data channel for transcripts
      const dataChannel = pc.createDataChannel('response');
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        // console.log("Data channel open");
        configureDataChannel(dataChannel);
      };
      dataChannel.onmessage = handleDataChannelMessage;

      // Add local (mic) track
      pc.addTrack(stream.getTracks()[0]);

      // Create offer & set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send SDP offer to OpenAI Realtime
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const response = await fetch(`${baseUrl}?model=${model}&voice=${voice}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          'Content-Type': 'application/sdp',
        },
      });

      // Set remote description
      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      setIsSessionActive(true);
      setStatus('Session established successfully!');
    } catch (err) {
      console.error('startSession error:', err);
      setStatus(`Error: ${err}`);
      stopSession();
    }
  }

  /**
   * Stop the session & cleanup
   */
  function stopSession() {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.remove('active');
    }
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    analyserRef.current = null;

    ephemeralUserMessageIdRef.current = null;

    setCurrentVolume(0);
    setIsSessionActive(false);
    setStatus('Session stopped');
    setMsgs([]);
    setConversation([]);
  }

  /**
   * Toggle start/stop from a single button
   */
  function handleStartStopClick() {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  }

  /**
   * Manually commit audio buffer (stop speaking and process)
   */
  function commitAudioBuffer() {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.error('Data channel not ready');
      return;
    }

    // Send input_audio_buffer.commit event
    const commitMessage = {
      type: 'input_audio_buffer.commit',
    };

    dataChannelRef.current.send(JSON.stringify(commitMessage));

    // Create response to process the audio
    const response = {
      type: 'response.create',
    };

    dataChannelRef.current.send(JSON.stringify(response));
  }

  /**
   * Send a text message through the data channel
   */
  function sendTextMessage(text: string) {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.error('Data channel not ready');
      return;
    }

    const messageId = uuidv4();

    // Add message to conversation immediately
    const newMessage: Conversation = {
      id: messageId,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
      isFinal: true,
      status: 'final',
    };

    setConversation(prev => [...prev, newMessage]);

    // Send message through data channel
    const message = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text,
          },
        ],
      },
    };

    const response = {
      type: 'response.create',
    };

    dataChannelRef.current.send(JSON.stringify(message));
    dataChannelRef.current.send(JSON.stringify(response));
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSession();
  }, []);

  return {
    status,
    isSessionActive,
    audioIndicatorRef,
    startSession,
    stopSession,
    handleStartStopClick,
    commitAudioBuffer,
    registerFunction,
    msgs,
    currentVolume,
    conversation,
    sendTextMessage,
  };
}
