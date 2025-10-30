

import { Component, Input, OnChanges, SimpleChanges, HostBinding } from '@angular/core';

@Component({
  selector: 'app-radial-time-graph',
  templateUrl: './radial-time-graph.component.html',
  styleUrls: ['./radial-time-graph.component.scss'],
})
export class RadialTimeGraphComponent implements OnChanges {
  /** Accepts Date, ISO string, or 'HH:mm' string */
  @Input() time: Date | string = new Date();
  /** size in px (width & height) */
  @Input() size = 160;
  /** circle stroke thickness */
  @Input() thickness = 12;
  /** animate changes */
  @Input() animate = true;
  /** color for filled arc (you can bind in html or style) */
  @Input() color = '#3880ff';

  radius = 0;
  circumference = 0;
  fraction = 0; // 0..1
  displayLabel = '';
  dashOffset = 0;
  lastFraction = 0;

  ngOnChanges(changes: SimpleChanges) {
    this.setup();
    this.updateFromTime(this.time);
  }

  private setup() {
    // radius = half minus stroke / 2 to keep stroke inside
    const r = (this.size / 2) - (this.thickness / 2);
    this.radius = r;
    this.circumference = 2 * Math.PI * r;
  }

  private parseTimeToFraction(t: Date | string): number {
    let d: Date;
    if (!t) d = new Date();
    else if (t instanceof Date) d = t;
    else if (typeof t === 'string') {
      // Accept "HH:mm" or ISO string
      const hhmm = /^\d{1,2}:\d{2}$/;
      if (hhmm.test(t)) {
        const parts = t.split(':').map(Number);
        d = new Date();
        d.setHours(parts[0], parts[1], 0, 0);
      } else {
        const parsed = new Date(t);
        if (isNaN(parsed.getTime())) d = new Date();
        else d = parsed;
      }
    } else d = new Date();

    const hours = d.getHours(); // 0..23
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    // fraction of 24h
    const frac = (hours + (minutes / 60) + (seconds / 3600)) / 24;
    // clamp
    return Math.max(0, Math.min(1, frac));
  }

  private updateFromTime(t: Date | string) {
    this.lastFraction = this.fraction;
    this.fraction = this.parseTimeToFraction(t);
    this.displayLabel = this.formatLabel(t);

    // stroke offset calculation (circle starts at top)
    // strokeDashoffset = circumference * (1 - fraction)
    const targetOffset = this.circumference * (1 - this.fraction);

    if (this.animate) {
      // animate with a simple step; duration proportional to change
      const duration = 600; // ms
      const steps = 24;
      const start = this.circumference * (1 - this.lastFraction);
      const diff = targetOffset - start;
      let step = 0;
      const intervalMs = Math.max(8, Math.round(duration / steps));
      const animator = setInterval(() => {
        step++;
        const progress = step / steps;
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        this.dashOffset = start + diff * eased;
        if (step >= steps) {
          clearInterval(animator);
          this.dashOffset = targetOffset;
        }
      }, intervalMs);
    } else {
      this.dashOffset = targetOffset;
    }
  }

  private formatLabel(t: Date | string) {
    let d: Date;
    if (t instanceof Date) d = t;
    else if (typeof t === 'string') {
      const hhmm = /^\d{1,2}:\d{2}$/;
      if (hhmm.test(t)) {
        const parts = t.split(':').map(Number);
        d = new Date();
        d.setHours(parts[0], parts[1], 0, 0);
      } else {
        const parsed = new Date(t);
        d = isNaN(parsed.getTime()) ? new Date() : parsed;
      }
    } else d = new Date();

    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
