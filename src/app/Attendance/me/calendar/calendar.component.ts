import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
interface CalendarDay {
  day: number | '';
  timing: string;
  isOff: boolean;
  date?: Date;
}
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone:true,
  imports: [IonicModule, CommonModule]

})
export class CalendarComponent  implements OnInit {
  calendarDays: CalendarDay[] = [];
  today: Date = new Date();
  weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  currentMonth: Date = new Date();
  constructor() { }


  ngOnInit() {
    const today = new Date();
    this.generateCalendar(today);
  }


  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar(this.currentMonth);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar(this.currentMonth);
  }

  generateCalendar(date: Date) {
    this.calendarDays = [];
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      this.calendarDays.push({ day: '', timing: '', isOff: false });
    }
    for (let day = 1; day <= lastDate; day++) {
      let timing = '9:30 AM - 6:30 PM';
      let isOff = false;
      const d = new Date(year, month, day).getDay();
      if (d === 0 || d === 6) {
        timing = '';
        isOff = true;
      }

      this.calendarDays.push({
        day, timing, isOff,
        date: new Date(year, month, day)
      });
    }
  }
  isTodayCalendarDay(cd: CalendarDay): boolean {
    if (!cd.date) return false;
    return (cd.date.getDate() === this.today.getDate() &&
      cd.date.getMonth() === this.today.getMonth() &&
      cd.date.getFullYear() === this.today.getFullYear()
    );
  }

  isToday(day: Date): boolean {
    return (
      day.getDate() === this.today.getDate() &&
      day.getMonth() === this.today.getMonth() &&
      day.getFullYear() === this.today.getFullYear()
    );
  }
}
