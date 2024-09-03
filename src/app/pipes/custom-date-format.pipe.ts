import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDateFormat',
  standalone: true
})
export class CustomDateFormatPipe implements PipeTransform {

  transform(value: Date | string): string {
    const date = new Date(value);

    // Get day, month and year
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }); // Full month name
    const year = date.getFullYear();
    const time = date.getHours() + ':' + date.getMinutes();

    // Return custom formatted date (day month year or any format)
    return `${day} ${month} ${year}, ${time}`;
  }

}