import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { JournalsPage } from './journals.page';
import { SharedModule } from '../../shared/shared.module';
import { JournalDetailComponent } from '../journal-detail/journal-detail.component';

const routes: Routes = [
  {
    path: '',
    component: JournalsPage
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
  declarations: [JournalsPage, JournalDetailComponent],
  entryComponents: [JournalDetailComponent]
})
export class JournalsPageModule {}
