export function isValidFullName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;
  const nameRegex = /^[a-zA-Z\u0590-\u05FF\s\-']+$/;
  return nameRegex.test(name.trim());
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const israelPhone = /^(\+972|0)?[2-9]\d{7,8}$/;
  return israelPhone.test(cleaned);
}

export function isValidDeliveryTime(time: string, date?: string): boolean {
  if (!time) return false;

  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  if (date) {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    if (dayOfWeek === 5) {
      return totalMinutes >= 13 * 60 && totalMinutes <= 15 * 60;
    } else if (dayOfWeek === 6) {
      return false;
    }
  }

  return totalMinutes >= 13 * 60 && totalMinutes <= 21 * 60;
}

export function isValidDeliveryDate(date: string): boolean {
  if (!date) return false;

  const selectedDate = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayOfWeek = selectedDate.getDay();
  if (dayOfWeek === 6) {
    return false;
  }

  return selectedDate >= tomorrow;
}

export function getAvailableDeliveryTimes(date: string): string[] {
  if (!date) return [];

  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();

  const times: string[] = [];

  if (dayOfWeek === 5) {
    for (let hour = 13; hour <= 15; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 15 && minute > 0) break;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
  } else if (dayOfWeek === 6) {
    return [];
  } else {
    for (let hour = 13; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute > 0) break;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
  }

  return times;
}

export function getMinDeliveryDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  if (cleaned.startsWith('+972')) {
    return cleaned;
  }

  if (cleaned.startsWith('0')) {
    return '+972' + cleaned.substring(1);
  }

  return '+972' + cleaned;
}
