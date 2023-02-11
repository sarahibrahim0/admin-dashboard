import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToggleModeService {

  oldValue

  ThemeObject = {
    oldValue: null,
    newValue: 'bootstrap'
  };

  mode: BehaviorSubject<object> = new BehaviorSubject<object>(this.ThemeObject);

  constructor() { }

  setTheme(theme: string) {

    this.mode.subscribe(Value=>{

      this.oldValue = Value;

   })

    this.mode.next(
      {
        oldValue:this.oldValue.newValue,
        newValue: theme
      });
  }
  themeChanges(): Observable<object> {
    return this.mode.asObservable();
  }
}
