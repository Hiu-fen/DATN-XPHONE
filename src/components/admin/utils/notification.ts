// Định nghĩa interface cho thông báo
export interface NotificationItem {
  id: string;
  message: string;
  time: string;
}

// Hàm thêm thông báo vào localStorage và tự động sắp xếp
export const addNotification = (message: string) => {
  const notifications: NotificationItem[] = JSON.parse(localStorage.getItem("notifications") || "[]");

  const isReminder = message.startsWith("Nhắc nhở");

  let updatedNotifications: NotificationItem[];

  if (isReminder) {
    // Xóa tất cả thông báo cũ bắt đầu bằng "Nhắc nhở"
    const filtered = notifications.filter(n => !n.message.startsWith("Nhắc nhở"));

    const newNotification: NotificationItem = {
      id: Date.now().toString(),
      message,
      time: new Date().toLocaleString(),
    };

    // Thêm thông báo mới vào đầu
    updatedNotifications = [newNotification, ...filtered];
  } else {
    const newNotification: NotificationItem = {
      id: Date.now().toString(),
      message,
      time: new Date().toLocaleString(),
    };

    updatedNotifications = [newNotification, ...notifications];
  }

  // Sắp xếp lại để nhắc nhở lên đầu (phòng trường hợp có nhiều loại thông báo)
  updatedNotifications.sort((a, b) => {
    const isAReminder = a.message.startsWith("Nhắc nhở");
    const isBReminder = b.message.startsWith("Nhắc nhở");
    if (isAReminder && !isBReminder) return -1;
    if (!isAReminder && isBReminder) return 1;
    return 0;
  });

  localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
};



// Hàm lấy danh sách thông báo từ localStorage
export const getNotifications = (): NotificationItem[] => {
  return JSON.parse(localStorage.getItem("notifications") || "[]");
};
