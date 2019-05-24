import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PapersPage } from './papers.page';
import { SharedModule } from '../../../shared/shared.module';
import { JournalDetailComponent } from '../journal-detail/journal-detail.component';
import { PaperDetailComponent } from '../paper-detail/paper-detail.component';

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
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PapersPage, PaperDetailComponent],
  entryComponents: [PaperDetailComponent]
})
export class PapersPageModule {}