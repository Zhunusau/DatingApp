import { Component, Input, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.css']
})
export class DateInputComponent implements ControlValueAccessor {
  @Input() label: string;
  @Input() maxDate: Date;
  @Input() minDate: Date;
  bsConfig: Partial<BsDatepickerConfig>

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
    // let dateNow = new Date();
    this.bsConfig = {
      containerClass: 'theme-default',
      dateInputFormat: 'DD MMMM YYYY',
      // maxDate: new Date(dateNow.getFullYear() - 18, dateNow.getMonth()),
      // minDate: new Date(dateNow.getFullYear() - 100, dateNow.getMonth())
    }
   }

  writeValue(obj: any): void {
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

}
