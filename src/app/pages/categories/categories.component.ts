import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { CategoriesService } from '../../services/categories/categories-service.service';
import { Component } from '@angular/core';
import { Category } from 'src/app/models/category';
import { Router } from '@angular/router';


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  constructor(private categoriesService: CategoriesService,
    private MessageService: MessageService,
    private ConfirmService: ConfirmationService,
    private router: Router) {
  }

  categories: Category[]

  getCategories() {
    return this.categoriesService.getCategories().subscribe(data => this.categories = data)
  }

  ngOnInit() {
    this.getCategories()
  }

  deleteCategory(id: string) {

    this.ConfirmService.confirm({
      message: 'Do you want to delete this category?',
      header: 'Delete Category',
      icon: 'pi pi-info-circle',
      accept: () => {
        return this.categoriesService.deleteCategories(id).subscribe({
          next: (category: Category) => {
            console.log(category)
            this.MessageService.add({ severity: 'success', summary: 'success', detail: `Category ${category.name} Is Deleted` });
            this.getCategories()

          },
          error: (error) => {
            this.MessageService.add({ severity: 'error', summary: 'error', detail: 'Category Is Not Deleted' });

          }
        })
      },
      reject: (type) => {



    }
   } );
  }

  editCategory(id: string) {
    this.router.navigateByUrl(`categories/form/${id}`)

  }

}
