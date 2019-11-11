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
        children: [
          {
            path: '',
            loadChildren: '../papers/papers.module#PapersPageModule',
            pathMatch: 'full'
          },
          {
            path: ':searchKey',
            loadChildren: '../papers/papers.module#PapersPageModule'
          }
        ]
      },
      {
        path: 'authors',
        children: [
          {
            path: '',
            loadChildren: '../authors/authors.module#AuthorsPageModule',
            pathMatch: 'full'
          },
          {
            path: ':searchKey',
            loadChildren: '../authors/authors.module#AuthorsPageModule'
          }
        ]
      },
      {
        path: 'journals',
        children: [
          {
            path: '',
            loadChildren: '../journals/journals.module#JournalsPageModule',
            pathMatch: 'full'
          },
          {
            path: ':searchKey',
            loadChildren: '../journals/journals.module#JournalsPageModule'
          }
        ]
      }
    ]
  },
  {
    path: 'author',
    children: [
      {
        path: '',
        redirectTo: '/search',
        pathMatch: 'full'
      },
      {
        path: ':authorID',
        loadChildren: '../author-detail/author-detail.module#AuthorDetailPageModule'
      }
    ]
  },
  {
    path: 'paper',
    children: [
      {
        path: '',
        redirectTo: '/search',
        pathMatch: 'full'
      },
      {
        path: ':paperID',
        loadChildren: '../paper-detail/paper-detail.module#PaperDetailPageModule'
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
