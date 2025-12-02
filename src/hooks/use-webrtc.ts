'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Conversation, Tool } from '@/types/conversation';
import { MODELS } from '@/lib/ai/models';

/**
 * Return type for the useWebRTCAudioSession hook
 * Contains state and controls for WebRTC audio sessions
 */
interface UseWebRTCAudioSessionReturn {
  /** Whether a WebRTC session is currently active */
  isSessionActive: boolean;
  /** Array of conversation messages (user and assistant) */
  conversation: Conversation[];
  /** Whether push-to-talk is currently active (user holding button) */
  isPushToTalkActive: boolean;
  /** Start push-to-talk mode - call when user presses talk button */
  startPushToTalk: () => void;
  /** Stop push-to-talk mode - call when user releases talk button */
  stopPushToTalk: () => void;
  /** Toggle session on/off - starts or stops the WebRTC connection */
  handleStartStopClick: () => void;
  /** Force stop the current session and cleanup resources */
  stopSession: () => void;
  /** Clear all conversation history */
  clearConversation: () => void;
}

/**
 * Character information for AI persona customization
 */
interface CharacterInfo {
  /** Character's display name */
  name: string;
  /** Character's personality description */
  description: string | null;
  /** How the character speaks (formal, casual, etc.) */
  speakingStyle: string | null;
  /** Relationship type (friend, teacher, etc.) */
  relationshipType: string | null;
}

/**
 * WebRTC Audio Session Hook
 *
 * Manages real-time audio conversations with OpenAI's Realtime API.
 * Uses WebRTC for low-latency bidirectional audio streaming.
 *
 * Features:
 * - Push-to-talk mode for controlled audio input
 * - Real-time transcription of user speech
 * - AI audio responses streamed back
 * - Conversation history tracking
 *
 * @param voice - OpenAI voice ID (e.g., 'alloy', 'echo', 'shimmer')
 * @param tools - Optional array of function tools for the AI
 * @param character - Optional character info for AI persona
 * @returns Object containing session state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   isSessionActive,
 *   handleStartStopClick,
 *   startPushToTalk,
 *   stopPushToTalk,
 *   conversation
 * } = useWebRTCAudioSession('shimmer', [], character);
 * ```
 */
export default function useWebRTCAudioSession(
  voice: string,
  tools?: Tool[],
  character?: CharacterInfo
): UseWebRTCAudioSessionReturn {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /** Whether WebRTC session is connected and active */
  const [isSessionActive, setIsSessionActive] = useState(false);

  /** Conversation history - both user and assistant messages */
  const [conversation, setConversation] = useState<Conversation[]>([]);

  /** Push-to-talk active state (user is holding talk button) */
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);

  // ============================================
  // REFS - Mutable values that persist across renders
  // ============================================

  /** Web Audio API context for processing audio */
  const audioContextRef = useRef<AudioContext | null>(null);

  /** MediaStream from user's microphone */
  const audioStreamRef = useRef<MediaStream | null>(null);

  /** WebRTC peer connection to OpenAI */
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  /** Data channel for sending/receiving messages with OpenAI */
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  /** Temporary ID for user message being transcribed (before finalization) */
  const ephemeralUserMessageIdRef = useRef<string | null>(null);

  /** Queue for assistant messages waiting for user message to be finalized */
  const pendingAssistantMessagesRef = useRef<Conversation[]>([]);

  // ============================================
  // TOKEN USAGE TRACKING (for usage-based credits)
  // ============================================

  /** Track audio input tokens (user speech) */
  const audioInputTokensRef = useRef<number>(0);

  /** Track audio output tokens (AI speech) */
  const audioOutputTokensRef = useRef<number>(0);

  /** Track text input tokens (instructions, context) */
  const textInputTokensRef = useRef<number>(0);

  /** Track text output tokens (transcription, etc.) */
  const textOutputTokensRef = useRef<number>(0);

  /** Session start time for duration tracking */
  const sessionStartTimeRef = useRef<number | null>(null);

  // ============================================
  // TRANSCRIPTION VALIDATION
  // Filters out Whisper hallucinations from background noise
  // ============================================

  /**
   * Validate transcription to filter out hallucinations
   * Whisper can generate random text from silence/noise
   */
  function isValidTranscription(text: string | undefined | null): boolean {
    if (!text) return false;

    const trimmed = text.trim();

    // Too short to be meaningful speech
    if (trimmed.length < 2) return false;

    // Common Whisper hallucination patterns (appears when processing silence/noise)
    const hallucinationPatterns = [
      /^(thank you|thanks)(\s+for\s+(watching|listening|viewing))?\.?$/i,
      /^subscribe/i,
      /^please\s+(like|subscribe)/i,
      /^see you/i,
      /^bye\.?$/i,
      /^다음에/i, // Korean "next time"
      /^감사합니다\.?$/i, // Korean "thank you"
      /다음에\s*봐요/i, // Korean "see you next time"
      /시청.*감사/i, // Korean "thanks for watching"
      /구독/i, // Korean "subscribe"
      /좋아요/i, // Korean "like"
      /^ご視聴/i, // Japanese "watching"
      /^ありがとう/i, // Japanese "thank you"
      /^次回/i, // Japanese "next time"
      /^再見/i, // Chinese "goodbye"
      /^謝謝/i, // Chinese "thank you"
      /^\.+$/, // Just dots
      /^,+$/, // Just commas
      /^\*+$/, // Just asterisks
      /^-+$/, // Just dashes
      /^…+$/, // Just ellipses
      /^[\s\p{P}]+$/u, // Only whitespace and punctuation
    ];

    // Check for common hallucination keywords anywhere in text
    const hallucinationKeywords = [
      '시청', // Korean "watching/viewing"
      'RZA', // Random artist names often appear
      '선배님', // Korean honorific often in hallucinations
      '구독자', // Korean "subscribers"
      'grown up', // Common in music-related hallucinations
    ];

    const lowerText = trimmed.toLowerCase();
    for (const keyword of hallucinationKeywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        console.log('Filtered hallucination (keyword):', trimmed);
        return false;
      }
    }

    for (const pattern of hallucinationPatterns) {
      if (pattern.test(trimmed)) {
        console.log('Filtered hallucination:', trimmed);
        return false;
      }
    }

    return true;
  }

  // ============================================
  // DATA CHANNEL CONFIGURATION
  // ============================================

  /**
   * Configure the WebRTC data channel with session settings
   * Called when data channel opens
   *
   * @param dataChannel - The RTCDataChannel to configure
   */
  function configureDataChannel(dataChannel: RTCDataChannel) {
    // Build session configuration object
    const sessionUpdate: {
      type: string;
      session: {
        modalities: string[];
        tools?: Tool[];
        input_audio_transcription?: { model: string; language?: string };
        turn_detection?: null;
      };
    } = {
      type: 'session.update',
      session: {
        // Enable both text and audio modalities
        modalities: ['text', 'audio'],
        // Use Whisper for transcribing user audio - force Japanese language
        input_audio_transcription: { model: 'whisper-1', language: 'ja' },
        // Disable automatic turn detection (we use push-to-talk)
        turn_detection: null,
      },
    };

    // Add function tools if provided
    if (tools && tools.length > 0) {
      sessionUpdate.session.tools = tools;
    }

    // Send configuration to OpenAI
    dataChannel.send(JSON.stringify(sessionUpdate));
  }

  // ============================================
  // EPHEMERAL USER MESSAGE MANAGEMENT
  // Handles the "in-progress" user message while speaking
  // ============================================

  /**
   * Get existing ephemeral user ID or create a new one
   * Creates a placeholder message in conversation while user is speaking
   *
   * @returns The ephemeral message ID
   */
  function getOrCreateEphemeralUserId(): string {
    let ephemeralId = ephemeralUserMessageIdRef.current;

    if (!ephemeralId) {
      // Generate new ID
      ephemeralId = uuidv4();
      ephemeralUserMessageIdRef.current = ephemeralId;

      // Add placeholder message to conversation
      setConversation(prev => [
        ...prev,
        {
          id: ephemeralId!,
          role: 'user',
          text: '',
          timestamp: new Date().toISOString(),
          isFinal: false,
          status: 'speaking',
        },
      ]);
    }

    return ephemeralId;
  }

  /**
   * Update the ephemeral (in-progress) user message
   * Used to show partial transcription as user speaks
   *
   * @param partial - Partial conversation object to merge
   */
  function updateEphemeralUserMessage(partial: Partial<Conversation>) {
    const ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) return;

    setConversation(prev =>
      prev.map(msg => (msg.id === ephemeralId ? { ...msg, ...partial } : msg))
    );
  }

  /**
   * Clear the ephemeral user message ID
   * Called after message is finalized
   */
  function clearEphemeralUserMessage() {
    ephemeralUserMessageIdRef.current = null;
  }

  /**
   * Flush any pending assistant messages to the conversation
   * Called after user message is finalized to ensure proper ordering
   */
  function flushPendingAssistantMessages() {
    if (pendingAssistantMessagesRef.current.length > 0) {
      const pendingMessages = [...pendingAssistantMessagesRef.current];
      pendingAssistantMessagesRef.current = [];

      setConversation(prev => {
        const filtered = prev.filter(m => !(m.role === 'assistant' && !m.isFinal));
        return [...filtered, ...pendingMessages];
      });
    }
  }

  // ============================================
  // DATA CHANNEL MESSAGE HANDLER
  // Processes all messages from OpenAI Realtime API
  // ============================================

  /**
   * Handle incoming messages from OpenAI via data channel
   * Processes various event types for transcription and responses
   *
   * @param event - MessageEvent containing JSON data from OpenAI
   */
  async function handleDataChannelMessage(event: MessageEvent) {
    try {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        // ----------------------------------------
        // ERROR HANDLING
        // ----------------------------------------
        case 'error': {
          const errorMessage =
            msg.error?.message || msg.message || msg.error_message || 'Unknown error';
          console.error('WebRTC error:', errorMessage);
          break;
        }

        // ----------------------------------------
        // USER SPEECH EVENTS
        // ----------------------------------------

        // User started speaking
        case 'input_audio_buffer.speech_started': {
          getOrCreateEphemeralUserId();
          updateEphemeralUserMessage({ status: 'speaking' });
          break;
        }

        // User stopped speaking
        case 'input_audio_buffer.speech_stopped': {
          updateEphemeralUserMessage({ status: 'speaking' });
          break;
        }

        // Audio buffer committed (ready for processing)
        case 'input_audio_buffer.committed': {
          updateEphemeralUserMessage({ text: 'Transcribing...', status: 'processing' });
          break;
        }

        // ----------------------------------------
        // TRANSCRIPTION EVENTS
        // ----------------------------------------

        // Partial transcription update (streaming)
        case 'conversation.item.input_audio_transcription.delta': {
          const ephemeralId = getOrCreateEphemeralUserId();
          setConversation(prev =>
            prev.map(convMsg =>
              convMsg.id === ephemeralId
                ? {
                    ...convMsg,
                    text: (convMsg.text || '') + (msg.delta || ''),
                    status: 'speaking',
                    isFinal: false,
                  }
                : convMsg
            )
          );
          break;
        }

        // Final transcription completed
        case 'conversation.item.input_audio_transcription.completed': {
          const transcript = msg.transcript || '';

          // Validate transcription - filter out hallucinations
          if (!isValidTranscription(transcript)) {
            // Remove ephemeral message without adding final
            setConversation(prev => {
              const ephemeralId = ephemeralUserMessageIdRef.current;
              return ephemeralId ? prev.filter(m => m.id !== ephemeralId) : prev;
            });
            clearEphemeralUserMessage();
            // Clear any pending assistant messages too (no valid input)
            pendingAssistantMessagesRef.current = [];
            break;
          }

          const finalUserMessage: Conversation = {
            id: msg.item_id || uuidv4(),
            role: 'user',
            text: transcript,
            timestamp: new Date().toISOString(),
            isFinal: true,
            status: 'final',
          };

          // Replace ephemeral message with final version
          setConversation(prev => {
            const ephemeralId = ephemeralUserMessageIdRef.current;
            const filtered = ephemeralId ? prev.filter(m => m.id !== ephemeralId) : prev;
            return [...filtered, finalUserMessage];
          });

          clearEphemeralUserMessage();

          // Now flush any assistant messages that were waiting
          setTimeout(() => flushPendingAssistantMessages(), 100);
          break;
        }

        // Conversation item created (backup for transcription)
        case 'conversation.item.created': {
          if (msg.item?.role === 'user' && msg.item?.type === 'message') {
            // Check if this contains audio transcription
            const audioContent = msg.item.content?.find(
              (c: { type: string }) => c.type === 'input_audio'
            );

            const transcript = audioContent?.transcript;

            // Validate transcription - filter out hallucinations
            if (transcript && isValidTranscription(transcript)) {
              const finalUserMessage: Conversation = {
                id: msg.item.id || uuidv4(),
                role: 'user',
                text: transcript,
                timestamp: new Date().toISOString(),
                isFinal: true,
                status: 'final',
              };

              setConversation(prev => {
                const ephemeralId = ephemeralUserMessageIdRef.current;
                const filtered = ephemeralId ? prev.filter(m => m.id !== ephemeralId) : prev;
                return [...filtered, finalUserMessage];
              });

              clearEphemeralUserMessage();

              // Now flush any assistant messages that were waiting
              setTimeout(() => flushPendingAssistantMessages(), 100);
            } else if (transcript) {
              // Invalid transcription - clean up
              setConversation(prev => {
                const ephemeralId = ephemeralUserMessageIdRef.current;
                return ephemeralId ? prev.filter(m => m.id !== ephemeralId) : prev;
              });
              clearEphemeralUserMessage();
              pendingAssistantMessagesRef.current = [];
            }
          }
          break;
        }

        // ----------------------------------------
        // ASSISTANT RESPONSE EVENTS
        // ----------------------------------------

        // Streaming transcript delta (ignored - we wait for final)
        case 'response.audio_transcript.delta':
          break;

        // Final assistant response transcript
        case 'response.audio_transcript.done': {
          const assistantMessage: Conversation = {
            id: msg.item_id || uuidv4(),
            role: 'assistant',
            text: msg.transcript || '',
            timestamp: new Date().toISOString(),
            isFinal: true,
            status: 'final',
          };

          // Check if user message is still being processed
          if (ephemeralUserMessageIdRef.current) {
            // Queue the assistant message until user message is finalized
            pendingAssistantMessagesRef.current.push(assistantMessage);
          } else {
            // User message already finalized, add assistant message directly
            setTimeout(() => {
              setConversation(prev => {
                // Remove any non-final assistant messages
                const filtered = prev.filter(m => !(m.role === 'assistant' && !m.isFinal));
                return [...filtered, assistantMessage];
              });
            }, 100);
          }
          break;
        }

        // ----------------------------------------
        // USAGE TRACKING EVENTS (for credit deduction)
        // ----------------------------------------

        // Response completed - contains usage data
        case 'response.done': {
          // Extract usage data from response
          const usage = msg.response?.usage;
          if (usage) {
            // Accumulate token usage
            if (usage.input_tokens) {
              textInputTokensRef.current += usage.input_tokens;
            }
            if (usage.output_tokens) {
              textOutputTokensRef.current += usage.output_tokens;
            }
            // Audio tokens might be in different fields depending on API version
            if (usage.input_token_details?.audio_tokens) {
              audioInputTokensRef.current += usage.input_token_details.audio_tokens;
            }
            if (usage.output_token_details?.audio_tokens) {
              audioOutputTokensRef.current += usage.output_token_details.audio_tokens;
            }

            console.log('[WebRTC] Usage accumulated:', {
              audioInput: audioInputTokensRef.current,
              audioOutput: audioOutputTokensRef.current,
              textInput: textInputTokensRef.current,
              textOutput: textOutputTokensRef.current,
            });
          }
          break;
        }

        default:
          // Ignore unhandled message types
          break;
      }
    } catch (error) {
      console.error('Error handling data channel message:', error);
    }
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  /**
   * Get ephemeral token from our backend API
   * Token is used to authenticate with OpenAI Realtime API
   *
   * @returns Promise resolving to the ephemeral token string
   */
  async function getEphemeralToken() {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character: character
          ? {
              name: character.name,
              description: character.description,
              speakingStyle: character.speakingStyle,
              relationshipType: character.relationshipType,
            }
          : undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get ephemeral token: ${response.status}`);
    }

    const data = await response.json();
    return data.client_secret.value;
  }

  /**
   * Start a new WebRTC session with OpenAI
   * Sets up microphone, peer connection, and data channel
   */
  async function startSession() {
    try {
      // Reset token usage counters for new session
      audioInputTokensRef.current = 0;
      audioOutputTokensRef.current = 0;
      textInputTokensRef.current = 0;
      textOutputTokensRef.current = 0;
      sessionStartTimeRef.current = Date.now();

      // Check for getUserMedia support
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'getUserMedia is not available. Please use HTTPS or check browser compatibility.'
        );
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Create audio context for processing
      const audioContext = new AudioContext();
      audioContext.createMediaStreamSource(stream);
      audioContextRef.current = audioContext;

      // Get authentication token from our backend
      const ephemeralToken = await getEphemeralToken();

      // Create WebRTC peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Create audio element for playing AI responses
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;

      // Handle incoming audio track from OpenAI
      pc.ontrack = event => {
        audioEl.srcObject = event.streams[0];
      };

      // Create data channel for control messages
      const dataChannel = pc.createDataChannel('response');
      dataChannelRef.current = dataChannel;
      dataChannel.onopen = () => configureDataChannel(dataChannel);
      dataChannel.onmessage = handleDataChannelMessage;

      // Add microphone track to peer connection
      const audioTrack = stream.getTracks()[0];
      pc.addTrack(audioTrack);

      // IMPORTANT: Disable audio track by default for push-to-talk mode
      // Audio will only be sent when user holds the PTT button
      audioTrack.enabled = false;

      // Create and set local offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const response = await fetch(`${baseUrl}?model=${MODELS.REALTIME}&voice=${voice}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          'Content-Type': 'application/sdp',
        },
      });

      // Set remote description from OpenAI's answer
      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      // Session is now active
      setIsSessionActive(true);
    } catch (err) {
      console.error('startSession error:', err);
      stopSession();
    }
  }

  /**
   * Deduct credits for realtime session usage
   * Called when session ends to charge for actual usage
   */
  async function deductCreditsForSession() {
    // Calculate session duration
    const sessionDurationSeconds = sessionStartTimeRef.current
      ? Math.ceil((Date.now() - sessionStartTimeRef.current) / 1000)
      : 0;

    // Only deduct if there was actual usage
    const hasUsage =
      audioInputTokensRef.current > 0 ||
      audioOutputTokensRef.current > 0 ||
      textInputTokensRef.current > 0 ||
      textOutputTokensRef.current > 0;

    if (!hasUsage) {
      console.log('[WebRTC] No usage to deduct');
      return;
    }

    try {
      const response = await fetch('/api/realtime/deduct-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioInputTokens: audioInputTokensRef.current,
          audioOutputTokens: audioOutputTokensRef.current,
          textInputTokens: textInputTokensRef.current,
          textOutputTokens: textOutputTokensRef.current,
          sessionDurationSeconds,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[WebRTC] Credits deducted:', {
          credits: result.credits,
          usdCost: result.usdCost,
          sessionDurationSeconds,
        });
      } else {
        console.error('[WebRTC] Failed to deduct credits:', response.status);
      }
    } catch (error) {
      console.error('[WebRTC] Error deducting credits:', error);
    }
  }

  /**
   * Stop the current WebRTC session and cleanup all resources
   * Closes data channel, peer connection, audio context, and media stream
   */
  function stopSession() {
    // Deduct credits for the session (fire-and-forget, don't block cleanup)
    deductCreditsForSession();

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop all media tracks (releases microphone)
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    // Reset ephemeral message state
    ephemeralUserMessageIdRef.current = null;

    // Reset session start time
    sessionStartTimeRef.current = null;

    // Update session state
    setIsSessionActive(false);
  }

  /**
   * Toggle session on/off
   * Convenience function for start/stop button
   */
  function handleStartStopClick() {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  }

  // ============================================
  // AUDIO BUFFER CONTROL
  // ============================================

  /**
   * Commit the audio buffer and request AI response
   * Called when user stops talking (releases push-to-talk)
   */
  function commitAudioBuffer() {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') return;

    // Commit the audio that was recorded
    dataChannelRef.current.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));

    // Request AI to generate a response
    dataChannelRef.current.send(JSON.stringify({ type: 'response.create' }));
  }

  // ============================================
  // PUSH-TO-TALK CONTROLS
  // ============================================

  /**
   * Start push-to-talk mode
   * Called when user presses and holds the talk button
   * Enables microphone audio transmission
   */
  function startPushToTalk() {
    if (!isSessionActive || !dataChannelRef.current) return;

    // Enable audio track to start sending audio to OpenAI
    if (audioStreamRef.current) {
      const audioTrack = audioStreamRef.current.getTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = true;
      }
    }

    setIsPushToTalkActive(true);
    getOrCreateEphemeralUserId();
  }

  /**
   * Stop push-to-talk mode
   * Called when user releases the talk button
   * Disables microphone, commits audio buffer, and triggers AI response
   */
  function stopPushToTalk() {
    if (!isSessionActive || !dataChannelRef.current) return;

    // Disable audio track to stop sending audio to OpenAI
    if (audioStreamRef.current) {
      const audioTrack = audioStreamRef.current.getTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
      }
    }

    setIsPushToTalkActive(false);
    commitAudioBuffer();
  }

  // ============================================
  // CONVERSATION MANAGEMENT
  // ============================================

  /**
   * Clear all conversation history
   */
  function clearConversation() {
    setConversation([]);
    ephemeralUserMessageIdRef.current = null;
  }

  // ============================================
  // CLEANUP EFFECT
  // ============================================

  /**
   * Cleanup effect - stops session when component unmounts
   */
  useEffect(() => {
    return () => stopSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // RETURN PUBLIC API
  // ============================================

  return {
    isSessionActive,
    conversation,
    isPushToTalkActive,
    startPushToTalk,
    stopPushToTalk,
    handleStartStopClick,
    stopSession,
    clearConversation,
  };
}
