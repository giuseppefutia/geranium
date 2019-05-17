import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PapersPage } from './papers.page';
import { ScrollVanishDirective } from '../../../directives/scroll-vanish.directive';

const routes: Routes = [
  {
    path: '',
    component: PapersPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PapersPage, ScrollVanishDirective]
})
export class PapersPageModule {}
