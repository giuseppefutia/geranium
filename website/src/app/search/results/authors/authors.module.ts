import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AuthorsPage } from './authors.page';
import { SharedModule } from '../../../shared/shared.module';
import { AuthorDetailComponent } from '../author-detail/author-detail.component';

const routes: Routes = [
  {
    path: '',
    component: AuthorsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AuthorsPage, AuthorDetailComponent],
  entryComponents: [AuthorDetailComponent]
})
export class AuthorsPageModule {}
