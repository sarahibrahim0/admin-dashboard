import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from './../../../models/user';
import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {

  users: User[] = []

  constructor(private router: Router, private userService: UsersService,
    private ConfirmService: ConfirmationService,
    private MessageService: MessageService) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    return this.userService.getUsers().subscribe(resUsers => {
      this.users = resUsers
    })
  }

  editUser(userId) {
    this.router.navigateByUrl(`user/form/${userId}`)




  }

  deleteUser(userId) {


    this.ConfirmService.confirm({
      message: 'Do you want to delete this product?',
      header: 'Delete Product',
      icon: 'pi pi-info-circle',
      accept: () => {
        return this.userService.deleteUser(userId).subscribe({
          next: (user: User) => {
            this.MessageService.add({ severity: 'success', summary: 'success', detail: `Product ${user.name} Is Deleted` });
            this.getUsers();

          },
          error: (error) => {
            this.MessageService.add({ severity: 'error', summary: 'error', detail: 'User Is Not Deleted' });

          }
        })
      },
      reject: (type) => {

      }


    });



  }

}
