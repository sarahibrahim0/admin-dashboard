import { Directive, Input , HostListener , HostBinding} from '@angular/core';

@Directive({
  selector: '[appOnClickBg]'
})
export class OnClickBgDirective {

 background : string = '#de2768'

  constructor() { }


  @HostBinding('class.tog') active : boolean = false;



  @HostListener('click',['$event']) onClick(){
    this.active=!this.active;
  }


}
