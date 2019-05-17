import { Injectable } from '@angular/core';
import { Paper } from '../models/paper.model';
import { Author } from '../models/author.model';
import { SimplifiedPaper } from '../models/simplified-paper.model';
import { SimplifiedAuthor } from '../models/simplified-author.model';
import { HttpClient } from '@angular/common/http';
import { pipe } from 'rxjs';

/*papers = [
    new Paper(
      'abc',
      "This is the title of a very long and complex paper and I don't want to break anything but I think that if the title is too long the card will be excessively tall",
      'This is the abstract: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers')],
      new Date(2019, 1, 19)
    ),
    new Paper(
      'cba',
      'Very short indeed',
      'This is the abstract and it is very very long: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers')],
      new Date(2019, 1, 18)
    ),
    new Paper(
      '111',
      'Another paper about Artificial Intelligence',
      "This is a concise abstract, let's see how the card view will behave",
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers'), new Author('900', 'P. Mussorgsky')],
      new Date(2019, 1, 17)
    ),
    new Paper(
      'ABC',
      'Paper11',
      'This is the abstract: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers')],
      new Date(2019, 1, 16)
    ),
    new Paper(
      'CBA',
      'Paper22',
      'This is the abstract and it is very very long: Keep close to Natures heart... and break clear away, \
      once in awhile, and climb a mountain or spend a week in the woods. Wash your \
      spirit clean.',
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers')],
      new Date(2019, 1, 15)
    ),
    new Paper(
      '222',
      'Paper33',
      "This is a concise abstract, let's see how the card view will behave",
      [new Author('123', 'J.K. Rowling'), new Author('782', 'D. Eggers'), new Author('900', 'P. Mussorgsky')],
      new Date(2019, 1, 14)
    )
  ]; */

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  public searchKey = '';

  // TODO: Change when connecting to server
  // It represents the size of the chunks retrieved from the server (pagination)
  private _blockSize = 6;
  simplifiedPapers = [
    new SimplifiedPaper(
      'abc',
      "This is the title of a very long and complex paper and I don't want \
      to break anything but I think that if the title is too long the card will be excessively tall",
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers')
      ],
      ['Journal1'],
      new Date(2010, 1, 10),
      "https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png"
    ),
    new SimplifiedPaper(
      'cba',
      'Very short indeed',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers')
      ],
      ['Journal2'],
      new Date(2011, 1, 10),
      "https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png"
    ),
    new SimplifiedPaper(
      '111',
      'Another paper about Artificial Intelligence',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers'),
        new SimplifiedAuthor('900', 'Modest Mussorgsky')
      ],
      ['Journal3', 'Journal3Bis'],
      new Date(2011, 1, 10),
      "https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png"
    ),
    new SimplifiedPaper(
      'ABC',
      'Paper11',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers')
      ],
      ['Journal4'],
      new Date(2012, 1, 10),
      "https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png"
    ),
    new SimplifiedPaper(
      'CBA',
      'Paper22',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers')
      ],
      ['Journal5'],
      new Date(2011, 1, 10),
      "https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png"
    ),
    new SimplifiedPaper(
      '222',
      'Paper33',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers'),
        new SimplifiedAuthor('900', 'Modest Mussorgsky')
      ],
      ['Journal6', 'Journal6Bis'],
      new Date(2016, 1, 10),
      "https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png"
    )
  ];

  constructor(private http: HttpClient) {}

  get blockSize(): number {
    return this._blockSize;
  }

  simplifyAuthorName(name: string): string {
    let builder = '';
    let i: number;
    name = name.replace(/[\p{P}\p{S}\p{C}\p{N}]+/g, '');
    name = name.replace(/\s+(?:[JS]R|I{1,3}|I[VX]|VI{0,3})$/gi, '');
    const names = name.split(' ');
    for (i = 0; i < names.length - 1; i++) {
      builder += names[i].charAt(0).toUpperCase() + '. ';
    }
    builder += names[i];
    return builder;
  }

  getSimplifiedPapersBlock(query: string, block: number) {
    for (const paper of this.simplifiedPapers) {
      for (const author of paper.authors) {
        author.name = this.simplifyAuthorName(author.name);
      }
    }
    return [...this.simplifiedPapers];
  }

  getPaperFromId(id: string): Paper {
    return new Paper(
      id,
      'Another paper about Artificial Intelligence',
      'This is the abstract: Keep close to Natures heart... and break clear away, \
    once in a while, and climb a mountain or spend a week in the woods. Wash your \
    spirit clean.',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers'),
        new SimplifiedAuthor('900', 'P. Mussorgsky')
      ],
      new Date(2019, 1, 14),
      ['Journal1'],
      "https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png"
    );
  }

  getAuthorFromId(authorId: string) {
    return new Author(authorId, 'Dave Eggers', ['AI', 'Neural Networks']);
  }

  fetchPapers(query: string) {
    const regex = / /g;
    const request = `PREFIX gpp:<http://geranium-project.org/publications/>
PREFIX gpk:<http://geranium-project.org/keywords/>
PREFIX purl:<http://purl.org/dc/terms/>
PREFIX dbp:<http://dbpedia.org/resource/>
select * where {
    ?publication purl:subject dbp:${query.replace(regex, '_')}
} limit 1000000`;
    this.http
      .get(
        'https://blazegraph.nexacenter.org/blazegraph/sparql?query=' +
          encodeURI('{}')
      )
      .subscribe(resData => {
        console.log(resData);
      });
  }
}