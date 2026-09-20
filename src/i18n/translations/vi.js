const vi = {
  pageTitle: "Điều khiển từ xa Kiosk",
  connectDesc: "Nhập mã 6 chữ số hiển thị trên màn hình kiosk",
  codePlaceholder: "VD: 482913",
  connectBtn: "Kết nối",
  headerDesc: "Nhấn để bật/tắt tính năng, hoặc chọn ngôn ngữ",
  connectedLabel: "Đã kết nối",
  disconnectBtn: "Ngắt kết nối",
  langTitle: "Chọn ngôn ngữ",
  langDefaultDesc: "Thay đổi màn hình sang ngôn ngữ bạn muốn",
  selectedSuffix: "đã chọn",
  autoDetectedSuffix: "(tự động phát hiện)",
  on: "Bật",
  off: "Tắt",
  listening: "Đang nghe...",
  notSupported: "Trình duyệt này không hỗ trợ nhận dạng giọng nói",
  notRecognized: "Không nhận dạng được lệnh",
  featureOnToast: (name) => `${name} đã bật`,
  featureOffToast: (name) => `${name} đã tắt`,
  languageToast: (name) => `Đã đổi ngôn ngữ sang ${name}`,
  features: {
    "easy-mode": { title: "Chế độ màn hình dễ dùng", desc: "Hiển thị hình ảnh lớn hơn và thêm hình minh họa" },
    voice: { title: "Nhận diện giọng nói", desc: "Điều khiển kiosk bằng giọng nói" },
    "large-text": { title: "Chữ lớn", desc: "Phóng to cỡ chữ" },
  },
};

export default vi;