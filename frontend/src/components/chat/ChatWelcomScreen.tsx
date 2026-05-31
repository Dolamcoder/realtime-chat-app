import { MessageCircle, Sparkles } from "lucide-react";

import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";

const ChatWelcomeScreen = () => {
  return (
    <SidebarInset className="relative flex h-full w-full overflow-hidden bg-transparent">
      <ChatWindowHeader/>
       {/* Background Blur */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[260px] w-[260px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-100px] h-[300px] w-[300px] rounded-full bg-violet-500/15 blur-3xl" />
      </div>
      <div className="flex flex-1">
        <div className="relative h-full w-full overflow-hidden bg-background/70 backdrop-blur-xl">
          <div className="grid h-full grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
            {/* LEFT */}
            <div className="relative flex flex-col justify-center overflow-hidden px-10 py-10 lg:px-14">
              {/* Glow */}
              <div className="absolute left-10 top-10 h-16 w-16 rounded-full bg-primary/10 blur-2xl" />
              <div className="absolute bottom-10 right-10 h-20 w-20 rounded-full bg-violet-500/10 blur-3xl" />

              {/* Logo */}
              <div className="mb-8 flex items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-cyan-400 shadow-[0_0_35px_rgba(139,92,246,0.35)]">
                  <MessageCircle className="h-8 w-8 text-white" />

                  <div className="absolute inset-0 rounded-2xl bg-white/10" />
                </div>

                <div>
                  <h1 className="bg-gradient-to-r from-primary via-violet-500 to-cyan-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
                    Alohub
                  </h1>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Connect • Chat • Share • Explore
                  </p>
                </div>
              </div>

              {/* Badge */}
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Nền tảng nhắn tin hiện đại
              </div>

              {/* Content */}
              <div className="max-w-[480px] space-y-5">
                <h2 className="text-4xl font-black leading-[1.1] tracking-tight text-foreground xl:text-5xl">
                  Chào mừng
                  <br />
                  trở lại 👋
                </h2>

                <p className="text-lg leading-8 text-muted-foreground">
                  Trò chuyện với bạn bè, tạo nhóm, chia sẻ cảm xúc và kết nối
                  mọi người trong một không gian cực kỳ mượt mà.
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative hidden items-center justify-center overflow-hidden lg:flex">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-violet-500/10 to-cyan-400/10" />

              {/* Grid */}
              <div className="absolute inset-0 opacity-[0.05]">
                <div className="h-full w-full bg-[linear-gradient(to_right,#00000022_1px,transparent_1px),linear-gradient(to_bottom,#00000022_1px,transparent_1px)] bg-[size:38px_38px]" />
              </div>

              {/* Cards */}
              <div className="relative h-[470px] w-[470px]">
                {" "}
                {/* Online Badge */}
                <div className="absolute right-2 top-2 rounded-2xl border border-white/20 bg-background/70 px-5 py-3 shadow-xl backdrop-blur-xl">
                  <p className="text-sm font-semibold">
                    ✨ 10K+ người đang online
                  </p>
                </div>
                {/* Card 1 */}
                <div className="absolute left-2 top-8 w-60 rotate-[-8deg] rounded-3xl border border-white/10 bg-background/80 p-4 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:rotate-0">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-orange-400" />

                    <div>
                      <p className="font-semibold">Minh Anh</p>

                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="w-fit rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                      Đi cafe không? ☕
                    </div>

                    <div className="ml-auto w-fit rounded-2xl bg-secondary px-4 py-2 text-sm">
                      Ok luôn 😆
                    </div>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="absolute bottom-2 right-[-10px] w-72 rotate-[8deg] rounded-3xl border border-white/10 bg-background/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:rotate-0">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Nhóm Dev VKU</h3>

                      <p className="text-sm text-muted-foreground">
                        12 thành viên đang hoạt động
                      </p>
                    </div>

                    <div className="flex -space-x-3">
                      <div className="h-10 w-10 rounded-full border-2 border-background bg-pink-500" />
                      <div className="h-10 w-10 rounded-full border-2 border-background bg-blue-500" />
                      <div className="h-10 w-10 rounded-full border-2 border-background bg-green-500" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-secondary p-3 text-sm">
                      🚀 Deploy production thành công rồi nhé!
                    </div>

                    <div className="rounded-2xl bg-primary p-3 text-sm text-primary-foreground">
                      🔥 UI mới nhìn cực xịn
                    </div>
                  </div>
                </div>
                {/* Center Blur */}
                <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default ChatWelcomeScreen;
