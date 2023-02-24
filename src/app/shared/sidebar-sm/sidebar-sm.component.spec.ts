import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSmComponent } from './sidebar-sm.component';

describe('SidebarSmComponent', () => {
  let component: SidebarSmComponent;
  let fixture: ComponentFixture<SidebarSmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarSmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarSmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
