import { Injectable } from '@angular/core';
import { Paper } from '../models/paper.model';

@Injectable({
  providedIn: 'root'
})
export class PapersService {
  papers = [
    new Paper(
      'abc',
      'This is the title of a very long and complex paper',
      'This is the abstract: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      ['J.K. Rowling', 'D. Eggers']
    ),
    new Paper(
      'cba',
      'Very short indeed',
      'This is the abstract and it is very very long: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      ['J.K. Rowling', 'D. Eggers']
    ),
    new Paper(
      '111',
      'Another paper about Artificial Intelligence',
      'This is a concise abstract, let\'s see how the card view will behave',
      ['J.K. Rowling', 'D. Eggers', 'P. Mussorgsky']
    ),
    new Paper(
      'ABC',
      'Paper11',
      'This is the abstract: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      ['J.K. Rowling', 'D. Eggers']
    ),
    new Paper(
      'CBA',
      'Paper22',
      'This is the abstract and it is very very long: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      ['J.K. Rowling', 'D. Eggers']
    ),
    new Paper(
      '222',
      'Paper33',
      'This is a concise abstract, let\'s see how the card view will behave',
      ['J.K. Rowling', 'D. Eggers', 'P. Mussorgsky']
    ),
  ];

  constructor() {}

  getPapers() {
    return [...this.papers];
  }
}
