// Định nghĩa interface cho thông báo
export interface NotificationItem {
  id: string;
  message: string;
  time: string;
}

// Hàm thêm thông báo vào localStorage và tự động sắp xếp
export const addNotification = (message: string) => {
  const notifications: NotificationItem[] = JSON.parse(localStorage.getItem("notifications") || "[]");

  const newNotification: NotificationItem = {
    id: Date.now().toString(),
    message,
    time: new Date().toLocaleString(),
  };

  const updatedNotifications = [newNotification, ...notifications];

  // Đưa các thông báo "Nhắc nhở" lên trước
  updatedNotifications.sort((a, b) => {
    const isAReminder = a.message.startsWith("Nhắc nhở");
    const isBReminder = b.message.startsWith("Nhắc nhở");

    if (isAReminder && !isBReminder) return -1;
    if (!isAReminder && isBReminder) return 1;
    return 0; // giữ nguyên thứ tự nếu cùng loại
  });

  localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
};

// Hàm lấy danh sách thông báo từ localStorage
export const getNotifications = (): NotificationItem[] => {
  return JSON.parse(localStorage.getItem("notifications") || "[]");
};
