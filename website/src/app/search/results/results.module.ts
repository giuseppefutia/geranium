import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule} from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { ResultsPage } from './results.page';
import { PaperDetailComponent } from './paper-detail/paper-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ResultsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ResultsPage, PaperDetailComponent],
  entryComponents: [PaperDetailComponent]
})
export class ResultsPageModule { }
