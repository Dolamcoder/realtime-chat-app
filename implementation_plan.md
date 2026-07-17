# Video Call Feature Implementation

## Mục tiêu
Phát triển thêm Video Call dựa trên nền WebRTC hiện có của Voice Call, với UI hiện đại: remote video full màn hình, local video picture-in-picture ở góc.

## Các thay đổi

---

### Frontend

#### [MODIFY] [useCallStore.ts](file:///d:/project-nodejs/Chat-App/frontend/src/stores/useCallStore.ts)

**Thêm vào state:**
- `callType: "audio" | "video"` — phân biệt loại cuộc gọi
- `isCameraOn: boolean` — trạng thái camera

**Thay đổi actions:**
- `startCall(targetUserId, name, avatar, callType)` — thêm param `callType`
  - Nếu `callType === "video"`: `getUserMedia({ audio: true, video: true })`
  - Nếu `callType === "audio"`: `getUserMedia({ audio: true, video: false })` (giữ nguyên)
  - Gửi kèm `callType` trong socket event `call-user`
- `handleIncomingCall(data)` — nhận thêm `callType` từ data, lưu vào state
- `toggleCamera()` — bật/tắt video track trong `localStream`

---

#### [MODIFY] [CallOverlay.tsx](file:///d:/project-nodejs/Chat-App/frontend/src/components/chat/CallOverlay.tsx)

Tách thành 2 layout:
- **Audio call**: UI hiện tại (avatar + tên + controls) — giữ nguyên
- **Video call**: UI mới hoàn toàn

**Video call UI:**
```
┌─────────────────────────────────────────┐
│                                         │
│         Remote video (full screen)      │
│                                         │
│                               ┌───────┐ │
│                               │ Local │ │
│                               │ video │ │
│                               │ (PiP) │ │
│                               └───────┘ │
│  ┌─────────────────────────────────┐    │
│  │  🎤  📷  📷off  📵  End call   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Incoming video call UI:**
- Hiện avatar + tên + "Cuộc gọi video đến..."
- 2 nút: Từ chối (đỏ) / Trả lời (xanh) với icon video

**Thêm refs:**
- `localVideoRef` — bind `localStream` (video của mình)
- `remoteVideoRef` — bind `remoteStream` (video đầu kia)

**Thêm controls:**
- Nút tắt/bật camera (`toggleCamera`)
- Nút tắt/bật mic (`toggleMute`) — đã có
- Nút kết thúc (`endCall`) — đã có

---

#### [MODIFY] [ChatWindowHeader.tsx](file:///d:/project-nodejs/Chat-App/frontend/src/components/chat/ChatWindowHeader.tsx)

- Thay `toast.info("đang phát triển")` thành gọi `startCall(id, name, avatar, "video")`
- Thêm check online giống nút voice call

---

### Backend

#### [MODIFY] [socket/index.js](file:///d:/project-nodejs/Chat-App/backend/src/socket/index.js)

- Event `call-user`: forward thêm field `callType` cho người nhận
- Event `incoming-call`: truyền `callType` đến receiver

Không cần thêm event mới — logic WebRTC giống hệt voice call, chỉ khác ở `getUserMedia`.

---

## UI Design - Video Call

```
┌──────────────────────────────────────────────────┐
│  [FULL SCREEN - Remote Video]                    │
│                                                  │
│  Tên người kia                     ┌──────────┐  │
│  Đang kết nối...                   │ Local    │  │
│                                    │ Camera   │  │
│                                    │ (120x90) │  │
│                                    └──────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  [Mic]  [Camera]  [EndCall]               │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Verification Plan

### Manual Testing
1. Laptop gọi video cho điện thoại → thấy camera
2. Điện thoại nhận → thấy "Cuộc gọi video đến..."
3. Nhận cuộc gọi → 2 bên thấy nhau
4. Bật/tắt camera trong khi gọi → bên kia thấy màn hình đen / thấy lại
5. Bật/tắt mic vẫn hoạt động
6. Kết thúc cuộc gọi từ 1 trong 2 bên

### Edge Cases
- Gọi audio từ header ← vẫn hoạt động bình thường (không ảnh hưởng)
- Từ chối cuộc gọi video → state reset đúng
- Đang gọi mà người kia gọi vào → auto reject (đã có logic)
