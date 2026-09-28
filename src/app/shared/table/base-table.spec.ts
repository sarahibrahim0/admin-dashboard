import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BaseTableComponent } from './base-table.component';
import { TableColumn } from './table-column';

@Component({
  template: `<app-base-table [columns]="cols" [data]="items" [totalCount]="count" [pageSize]="pageSize" />`,
  imports: [BaseTableComponent],
})
class HostComponent {
  items = signal([
    { id: '1', name: 'First' },
    { id: '2', name: 'Second' },
    { id: '3', name: 'Third' },
    { id: '4', name: 'Fourth' },
    { id: '5', name: 'Fifth' },
  ]);
  count = signal(5);
  pageSize = signal(2);
  cols: TableColumn[] = [{ field: 'name', header: 'Name' }];
}

describe('BaseTableComponent', () => {
  let fixture: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function rowNames(): string[] {
    const rows = Array.from(fixture.nativeElement.querySelectorAll('tbody tr')) as HTMLElement[];
    return rows.map((tr) => tr.textContent?.trim() ?? '');
  }

  function clickButton(text: string): void {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const btn = buttons.find((b: HTMLButtonElement) => b.textContent?.trim() === text);
    (btn as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  it('renders only the current page of rows', () => {
    expect(rowNames()).toEqual(['First', 'Second']);
    expect(fixture.nativeElement.textContent).toContain('Showing 1 to 2 of 5');
  });

  it('navigates to the next page', () => {
    clickButton('Next');
    expect(rowNames()).toEqual(['Third', 'Fourth']);
    expect(fixture.nativeElement.textContent).toContain('Showing 3 to 4 of 5');
  });

  it('jumps to the last page', () => {
    clickButton('3');
    expect(rowNames()).toEqual(['Fifth']);
  });

  it('resets to page 1 when data changes', () => {
    clickButton('3');
    fixture.componentInstance.items.set([{ id: '6', name: 'Sixth' }]);
    fixture.componentInstance.count.set(1);
    fixture.detectChanges();
    expect(rowNames()).toEqual(['Sixth']);
    expect(fixture.nativeElement.textContent).toContain('Showing 1 to 1 of 1');
  });
});