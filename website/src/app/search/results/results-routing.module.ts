import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResultsPage } from './results.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: ResultsPage,
    children: [
      {
        path: 'papers',
        loadChildren: './papers/papers.module#PapersPageModule'
      },
      {
        path: 'authors',
        loadChildren: './authors/authors.module#AuthorsPageModule'
      },
      {
        path: 'journals',
        loadChildren: './journals/journals.module#JournalsPageModule'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/search',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultsRoutingModule {}
