"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

interface ChatMsg {
  id: number;
  mine: boolean;
  text: string;
}

/* 1:1 화상 — 양쪽 비디오 · 함께 보는 영상 · 채팅 3분할 (프로토타입 목) */
export default function VideoCallPage() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, seekers } = useStore();
  const router = useRouter();

  const [micOn, setMicOn] = useState(true);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { id: 1, mine: false, text: "안녕하세요! 잘 보이시나요?" },
    { id: 2, mine: true, text: "네, 잘 보여요. 오늘 영상 함께 볼까요?" },
  ]);
  const [input, setInput] = useState("");
  const nextId = useRef(3);
  const listRef = useRef<HTMLDivElement>(null);

  const seeker = seekers.find((s) => s.id === id);
  if (!currentUser || !seeker) return null;

  const send = () => {
    if (!input.trim()) return;
    setMsgs((xs) => [...xs, { id: nextId.current++, mine: true, text: input.trim() }]);
    setInput("");
    requestAnimationFrame(() =>
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }),
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0c1420] text-white">
      {/* 상단 상태바 */}
      <div className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-4">
        <span className="flex h-2 w-2 rounded-full bg-sage [animation:pulse-dot_2s_ease-in-out_infinite]" />
        <span className="text-[13px] font-semibold">{seeker.name}님과 화상 중</span>
        <span className="tnum ml-auto rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/70">
          12:34
        </span>
      </div>

      {/* 1) 양쪽 비디오 */}
      <div className="grid shrink-0 grid-cols-2 gap-2 px-4">
        {[
          { name: seeker.name, me: false },
          { name: currentUser.name, me: true },
        ].map((v) => (
          <div
            key={v.name}
            className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl"
            style={{
              background: v.me
                ? "linear-gradient(140deg, #17293e 0%, #1c3a5c 100%)"
                : "linear-gradient(140deg, #1c3a5c 0%, #1b4f8a 100%)",
            }}
          >
            <Avatar name={v.name} size={44} className="opacity-90" />
            <span className="absolute bottom-2 left-2.5 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
              {v.me && !micOn && <Icon name="mic-off" size={11} className="text-coral" />}
              {v.me ? "나" : v.name}
            </span>
          </div>
        ))}
      </div>

      {/* 2) 함께 보는 영상 */}
      <div className="shrink-0 px-4 pt-2">
        <div
          className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(140deg, #0e1b2c 0%, #163f6e 100%)" }}
        >
          <span className="absolute left-3 top-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-white/60">
            <Icon name="play" size={11} className="fill-white/60" />
            함께 보는 영상
          </span>
          <button
            aria-label="재생"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12 backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-white/20"
          >
            <Icon name="play" size={20} className="ml-0.5 fill-white" />
          </button>
          <span className="absolute bottom-2.5 left-3 right-3">
            <span className="block h-1 overflow-hidden rounded-full bg-white/15">
              <span className="block h-full w-1/3 rounded-full bg-royal-bright" />
            </span>
          </span>
        </div>
      </div>

      {/* 3) 채팅 */}
      <div className="mt-2 flex min-h-0 flex-1 flex-col border-t border-white/10 bg-white/[0.03]">
        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="flex flex-col gap-2">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[75%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed",
                  m.mine
                    ? "self-end rounded-br-md bg-royal text-white"
                    : "self-start rounded-bl-md bg-white/10 text-white/90",
                )}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
        {/* 입력 + 컨트롤 */}
        <div className="flex shrink-0 items-center gap-2 px-4 pb-[max(env(safe-area-inset-bottom),14px)] pt-2">
          <button
            onClick={() => setMicOn((v) => !v)}
            aria-label={micOn ? "마이크 끄기" : "마이크 켜기"}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
              micOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-coral text-white",
            )}
          >
            <Icon name={micOn ? "mic" : "mic-off"} size={17} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="메시지 보내기"
            className="h-10 min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-4 text-sm text-white placeholder:text-white/40 focus:border-royal-bright"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            aria-label="전송"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-royal text-white transition-all duration-200 hover:bg-royal-bright active:scale-95 disabled:opacity-40"
          >
            <Icon name="send" size={16} />
          </button>
          <button
            onClick={() => router.push(`/guide/seeker/${seeker.id}`)}
            aria-label="통화 종료"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-white transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            <Icon name="phone-off" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
