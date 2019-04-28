import { Injectable } from '@angular/core';
import { Paper } from '../models/paper.model';

@Injectable({
  providedIn: 'root'
})
export class PapersService {
  papers = [
    new Paper(
      'abc',
      "This is the title of a very long and complex paper and I don't want to break anything but I think that if the title is too long the card will be excessively tall",
      'This is the abstract: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      ['J.K. Rowling', 'D. Eggers'],
      new Date(2019, 1, 19)
    ),
    new Paper(
      'cba',
      'Very short indeed',
      'This is the abstract and it is very very long: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      ['J.K. Rowling', 'D. Eggers'],
      new Date(2019, 1, 18)
    ),
    new Paper(
      '111',
      'Another paper about Artificial Intelligence',
      "This is a concise abstract, let's see how the card view will behave",
      ['J.K. Rowling', 'D. Eggers', 'P. Mussorgsky'],
      new Date(2019, 1, 17)
    ),
    new Paper(
      'ABC',
      'Paper11',
      'This is the abstract: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      ['J.K. Rowling', 'D. Eggers'],
      new Date(2019, 1, 16)
    ),
    new Paper(
      'CBA',
      'Paper22',
      'This is the abstract and it is very very long: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      ['J.K. Rowling', 'D. Eggers'],
      new Date(2019, 1, 15)
    ),
    new Paper(
      '222',
      'Paper33',
      "This is a concise abstract, let's see how the card view will behave",
      ['J.K. Rowling', 'D. Eggers', 'P. Mussorgsky'],
      new Date(2019, 1, 14)
    )
  ];

  constructor() {}

  getPapers(query: string) {
    return [...this.papers];
  }

  fetchPapers(query: string) {
    const regex = / /g;
    const request = `PREFIX gpp:<http://geranium-project.org/publications/>
PREFIX gpk:<http://geranium-project.org/keywords/>
PREFIX purl:<http://purl.org/dc/terms/>
PREFIX dbp:<http://dbpedia.org/resource/>
select * where {
    ?publication purl:subject dbp:{${query.replace(regex, '_')}}
} limit 1000000`;
  }
}
