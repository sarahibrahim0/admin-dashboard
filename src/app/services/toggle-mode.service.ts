import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable, Renderer2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToggleModeService {



mode: string = 'light'
  constructor() { }


  setLightMode(){
  this.mode = 'light'

  };

  setDarkMode(){
    this.mode = 'dark'
  }




}


