# Kế hoạch Triển khai Indoor Mapping (Giai đoạn 3: Thuật toán & Vẽ đường đi)

Tuyệt vời! Giai đoạn 2 (Hiển thị và Điều hướng Map) đã hoàn tất mỹ mãn và rất tối ưu (Scalable). Bây giờ là lúc giải quyết bài toán cốt lõi: **Tìm đường (Pathfinding) trong nhà đa tầng**.

## Mục tiêu (Goal)
1. Cài đặt thuật toán Dijkstra để tìm đường đi ngắn nhất giữa các điểm (Nodes).
2. Xử lý bài toán **Đa tầng (Cross-floor)**: Đường đi có thể nối từ Phòng (Tầng G) -> Hành lang -> Cầu thang (Tầng G) -> Cầu thang (Tầng 1) -> Phòng (Tầng 1).
3. Vẽ đường chỉ dẫn (Line) trực quan đè lên sơ đồ SVG hiện tại.

---

## Đề xuất Kiến trúc

### 1. Thuật toán Pathfinding (`src/utils/pathfinding.ts`)
Mình sẽ viết một thuật toán Dijkstra kinh điển:
- **Input**: Đồ thị (Graph), Node Bắt đầu (Start), Node Kết thúc (End).
- **Output**: Một mảng tuần tự các Node tạo thành lộ trình ngắn nhất. `[node_A, node_B, stairs_G, stairs_1, node_C]`.
- **Cấu trúc Dữ liệu**: Sẽ định nghĩa trong `src/utils/indoor_graph.ts`. (Tạm thời mình sẽ hardcode một lộ trình thử nghiệm hoàn chỉnh từ Tầng G -> Tầng 1 -> Tầng 2 để test thuật toán).

### 2. Vẽ đường đi trên SVG (`src/components/IndoorPathOverlay.tsx`)
Vì chúng ta đã import SVG dưới dạng Component nguyên khối (e.g., `<FloorGB11 />`), chúng ta không thể "nhét" thêm thẻ path vào trong đó. 
- **Giải pháp**: Tạo một layer `<Svg>` thứ 2 nằm **đè chính xác (absolute)** lên trên SVG gốc. Layer này phải dùng chung `viewBox` (vd: `0 0 2971 786`) để tọa độ x, y của thuật toán hoàn toàn ăn khớp với hình nền.
- Sử dụng `<Polyline>` hoặc `<Path>` của thư viện `react-native-svg` để vẽ các đường nét đứt (dashed line) nối các điểm (x, y) trên cùng 1 tầng.

### 3. Trải nghiệm người dùng đa tầng (Cross-floor UX)
Khi lộ trình đi qua nhiều tầng:
- Đang ở Tầng G: Sẽ vẽ đường từ Cửa tới Cầu thang. Chỗ cầu thang sẽ có một Icon/Text nhỏ: **"Lên Tầng 1"**.
- Người dùng bấm chọn Tầng 1: Màn hình vẽ tiếp đường từ Cầu thang Tầng 1 tới Phòng.

### 4. Cập nhật `IndoorMapScreen.tsx`
- Thêm biến state để lưu trữ Lộ trình hiện tại (`currentRoute`).
- Thêm 2 nút test nghiệm nghiệm nhanh trên màn hình:
  - Nút "Tìm đường Tầng G -> Tầng 2".
  - Nút "Xóa lộ trình".

---

## Yêu cầu Kiểm duyệt (User Review Required)

> [!IMPORTANT]
> **Về việc tạo dữ liệu Tọa độ (Nodes/Edges)**
> Để thuật toán có thể vẽ đường, chúng ta cần một file Graph định nghĩa chính xác **tọa độ x, y** của tất cả các phòng và ngã rẽ hành lang. Hiện tại mình không có file tự động trích xuất tọa độ này từ Figma. Do đó, mình sẽ **thủ công trích xuất tọa độ của một vài điểm** (Cửa, Hành lang, Cầu thang, 1-2 Phòng) ở Tòa B11 để lập ra một lộ trình test nghiệm thu thuật toán. Sau khi thuật toán chạy hoàn hảo, bạn (với tư cách là người có file thiết kế) sẽ dùng một công cụ nhỏ để bóc tách các tọa độ còn lại sau nhé. Bạn đồng ý phương án này chứ?

> [!NOTE]
> Mình sẽ bắt tay vào code các file thuật toán và vẽ SVG đè ngay khi bạn xác nhận kế hoạch.

## Kế hoạch Kiểm tra (Verification Plan)
- Bấm nút "Test Tìm đường" trên màn hình Indoor.
- Mở Tầng G: Thấy một đường nét đứt màu xanh dương vẽ từ cửa chính tới cầu thang.
- Gạt sang Tầng 1: Thấy đường xanh vẽ từ cầu thang tới phòng 104.
- Gạt sang Tầng 2: Thấy đường xanh vẽ tiếp từ cầu thang tới điểm đích.
