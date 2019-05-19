import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ResultsPage } from './results.page';
import { PaperDetailComponent } from './paper-detail/paper-detail.component';
import { AuthorDetailComponent } from './author-detail/author-detail.component';
import { ResultsRoutingModule } from './results-routing.module';
import { JournalDetailComponent } from './journal-detail/journal-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultsRoutingModule
  ],
  declarations: [ResultsPage]
})
export class ResultsPageModule { }
