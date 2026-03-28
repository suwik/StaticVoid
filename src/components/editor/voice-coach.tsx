"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GoogleGenAI, Modality } from "@google/genai";
import { buildVoiceCoachPrompt } from "@/lib/gemini/prompts";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

interface VoiceCoachProps {
  sessionId: string;
  question: string;
  markScheme: string;
  essayContent: string;
  timeRemaining: number;
  timeLimit: number;
  disabled?: boolean;
}

export function VoiceCoach({
  question,
  markScheme,
  essayContent,
  timeRemaining,
  timeLimit,
  disabled,
}: VoiceCoachProps) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<
    { role: "user" | "model"; text: string }[]
  >([]);

  const sessionRef = useRef<Awaited<
    ReturnType<InstanceType<typeof GoogleGenAI>["live"]["connect"]>
  > | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Scroll transcript to bottom on new messages
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Build system instruction with current essay context
  const buildSystemInstruction = useCallback(() => {
    return buildVoiceCoachPrompt({
      question,
      markScheme,
      essaySoFar: essayContent,
      timeRemaining,
      timeLimit,
    });
  }, [question, markScheme, essayContent, timeRemaining, timeLimit]);

  // Convert Float32Array to 16-bit PCM
  const float32ToPcm16 = useCallback((float32: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  }, []);

  // Play audio from queue
  const playNextChunk = useCallback(async () => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0) return;
    if (!audioContextRef.current) return;

    isPlayingRef.current = true;
    setIsModelSpeaking(true);

    while (playbackQueueRef.current.length > 0) {
      const chunk = playbackQueueRef.current.shift()!;
      // Output is 24kHz 16-bit PCM mono
      const int16 = new Int16Array(chunk);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 0x8000;
      }

      const audioBuffer = audioContextRef.current.createBuffer(
        1,
        float32.length,
        24000
      );
      audioBuffer.getChannelData(0).set(float32);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      await new Promise<void>((resolve) => {
        source.onended = () => resolve();
        source.start();
      });
    }

    isPlayingRef.current = false;
    setIsModelSpeaking(false);
  }, []);

  // Connect to Gemini Live API
  const connect = useCallback(async () => {
    if (connectionState === "connecting" || connectionState === "connected")
      return;

    setConnectionState("connecting");
    setTranscript([]);

    try {
      // 1. Get ephemeral token from our backend
      const systemInstruction = buildSystemInstruction();
      const tokenRes = await fetch("/api/live-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemInstruction }),
      });
      if (!tokenRes.ok) {
        throw new Error("Failed to get session token");
      }
      const { token } = await tokenRes.json();

      // 2. Create AudioContext and get mic access
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 3. Connect to Live API with ephemeral token (v1alpha required for ephemeral tokens)
      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: "v1alpha" },
      });
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setConnectionState("connected");
          },
          onmessage: (message) => {
            const content = message.serverContent;
            if (!content) return;

            // Audio data
            if (content.modelTurn?.parts) {
              for (const part of content.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const binary = atob(part.inlineData.data);
                  const bytes = new Uint8Array(binary.length);
                  for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                  }
                  playbackQueueRef.current.push(bytes.buffer);
                  playNextChunk();
                }
              }
            }

            // Transcriptions
            if (content.inputTranscription?.text) {
              const text = content.inputTranscription.text.trim();
              if (text) {
                setTranscript((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "user") {
                    return [
                      ...prev.slice(0, -1),
                      { role: "user", text: last.text + " " + text },
                    ];
                  }
                  return [...prev, { role: "user", text }];
                });
              }
            }

            if (content.outputTranscription?.text) {
              const text = content.outputTranscription.text.trim();
              if (text) {
                setTranscript((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "model") {
                    return [
                      ...prev.slice(0, -1),
                      { role: "model", text: last.text + " " + text },
                    ];
                  }
                  return [...prev, { role: "model", text }];
                });
              }
            }

            // Interruption — clear playback queue
            if (content.interrupted) {
              playbackQueueRef.current = [];
              isPlayingRef.current = false;
              setIsModelSpeaking(false);
            }
          },
          onerror: (error) => {
            console.error(
              "Live API error:",
              error instanceof Error
                ? error.message
                : JSON.stringify(error, null, 2)
            );
            setConnectionState("error");
          },
          onclose: () => {
            setConnectionState("disconnected");
          },
        },
      });

      sessionRef.current = session;

      // 4. Start sending mic audio
      const source = audioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current
      );
      // ScriptProcessorNode is deprecated but widely supported — AudioWorklet
      // would require a separate file which adds complexity for a hackathon build
      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !sessionRef.current) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm = float32ToPcm16(inputData);
        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(pcm))
        );
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64, mimeType: "audio/pcm;rate=16000" },
        });
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
    } catch (err) {
      console.error("Failed to connect:", err);
      setConnectionState("error");
      cleanup();
    }
  }, [
    connectionState,
    buildSystemInstruction,
    float32ToPcm16,
    playNextChunk,
  ]);

  // Cleanup all resources
  const cleanup = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    if (
      audioContextRef.current &&
      audioContextRef.current.state !== "closed"
    ) {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;

    sessionRef.current?.close();
    sessionRef.current = null;

    playbackQueueRef.current = [];
    isPlayingRef.current = false;
    setIsModelSpeaking(false);
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
    setConnectionState("disconnected");
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      isMutedRef.current = !prev;
      return !prev;
    });
  }, []);

  const isActive =
    connectionState === "connected" || connectionState === "connecting";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="size-4 text-muted-foreground" />
            <span className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
              Voice Coach
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "size-2 rounded-full",
                connectionState === "connected" && "bg-emerald-500",
                connectionState === "connecting" && "bg-amber-500 animate-pulse",
                connectionState === "disconnected" && "bg-zinc-400",
                connectionState === "error" && "bg-red-500"
              )}
            />
            <span className="text-[0.6rem] text-muted-foreground">
              {connectionState === "connected" && "Live"}
              {connectionState === "connecting" && "Connecting..."}
              {connectionState === "disconnected" && "Off"}
              {connectionState === "error" && "Error"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {!isActive ? (
            <Button
              onClick={connect}
              disabled={disabled}
              size="sm"
              className="flex-1 gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Phone className="size-3.5" />
              Start Voice Chat
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                size="sm"
                variant={isMuted ? "destructive" : "outline"}
                className="gap-1.5 rounded-full"
              >
                {isMuted ? (
                  <MicOff className="size-3.5" />
                ) : (
                  <Mic className="size-3.5" />
                )}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                onClick={disconnect}
                size="sm"
                variant="destructive"
                className="gap-1.5 rounded-full"
              >
                <PhoneOff className="size-3.5" />
                End
              </Button>
            </>
          )}
        </div>

        {connectionState === "error" && (
          <p className="text-xs text-red-400">
            Connection failed. Check your microphone permissions and try again.
          </p>
        )}
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {connectionState === "disconnected" && transcript.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-2">
            <Mic className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Talk to your AI coach about your essay. Ask for advice, discuss
              ideas, or work through tricky sections.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Your coach can see your essay and mark scheme in real-time.
            </p>
          </div>
        )}

        {transcript.map((entry, i) => (
          <div
            key={i}
            className={cn(
              "text-sm rounded-2xl px-3 py-2 max-w-[90%]",
              entry.role === "user"
                ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                : "mr-auto bg-muted rounded-bl-sm"
            )}
          >
            {entry.text}
          </div>
        ))}

        {isModelSpeaking && (
          <div className="mr-auto flex items-center gap-1.5 px-3 py-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:150ms]" />
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse [animation-delay:300ms]" />
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
}
