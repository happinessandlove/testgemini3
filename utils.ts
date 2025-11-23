
export const WEEKS = ['日', '一', '二', '三', '四', '五', '六'];

export const formatDate = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = WEEKS[date.getDay()];
  return `${month}月${day}日 周${week}`;
};

export const getMonths = (startDate: Date, count: number) => {
  const months = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    months.push(d);
  }
  return months;
};

export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  
  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  // Days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

export const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const isToday = (date: Date) => {
  const today = new Date();
  return isSameDay(date, today);
};
