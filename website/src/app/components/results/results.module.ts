import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ResultsPage } from './results.page';
import { ResultsRoutingModule } from './results-routing.module';

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
