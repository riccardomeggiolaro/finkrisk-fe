import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeConverter',
  standalone: true
})
export class TimeConverterPipe implements PipeTransform {
  transform(value: number): string {
    if (isNaN(value) || value < 0) {
      return '00:00';
    }

    const minutes = Math.floor(value / 60);
    const seconds = value % 60;

    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }
}