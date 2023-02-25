import { BehaviorSubject } from 'rxjs';
import { ToggleModeService } from './../../services/toggle-mode.service';
import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-toggle-mode',
  templateUrl: './toggle-mode.component.html',
  styleUrls: ['./toggle-mode.component.scss']
})
export class ToggleModeComponent implements OnInit {

  theme: boolean


  constructor(private ToggleModeService: ToggleModeService, private Renderer2: Renderer2) { }

  ngOnInit(): void {

    this.ToggleModeService.mode$.subscribe(mode => {
      this.theme = mode;
    })
  }

  setlight() {


    this.ToggleModeService.mode$.subscribe(mode => {
      this.theme = mode;
    })
    this.ToggleModeService.mode$.next(true)

    this.ToggleModeService.setLightMode();
    this.Renderer2.setAttribute(document.querySelector('html'), 'data-bs-theme', this.ToggleModeService.mode);

  };

  setDark() {



    this.ToggleModeService.mode$.next(false);
    this.ToggleModeService.setDarkMode();
    this.Renderer2.setAttribute(document.querySelector('html'), 'data-bs-theme', this.ToggleModeService.mode);

  }

}
