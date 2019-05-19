import { Injectable } from '@angular/core';
import { Paper } from '../models/paper.model';
import { Author } from '../models/author.model';
import { SimplifiedPaper } from '../models/simplified-paper.model';
import { SimplifiedAuthor } from '../models/simplified-author.model';
import { HttpClient } from '@angular/common/http';
import { AuthorsService } from './authors.service';

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
export class PapersService {
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
      ['Deep Learning', 'AI'],
      new Date(2010, 1, 10),
      'https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png'
    ),
    new SimplifiedPaper(
      'cba',
      'Very short indeed',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers')
      ],
      ['Deep Learning', 'AI', 'Machine Learning'],
      new Date(2011, 1, 10),
      'https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png'
    ),
    new SimplifiedPaper(
      '111',
      'Another paper about Artificial Intelligence',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers'),
        new SimplifiedAuthor('900', 'Modest Mussorgsky')
      ],
      ['Deep Learning', 'Sound Design'],
      new Date(2011, 1, 10),
      'https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png'
    ),
    new SimplifiedPaper(
      'ABC',
      'Paper11',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers')
      ],
      ['Deep Learning', 'Media Quality'],
      new Date(2012, 1, 10),
      'https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png'
    ),
    new SimplifiedPaper(
      'CBA',
      'Paper22',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers')
      ],
      ['Deep Learning', 'AI', 'Education', 'Teaching', 'Psychology'],
      new Date(2011, 1, 10),
      'https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png'
    ),
    new SimplifiedPaper(
      '222',
      'Paper33',
      [
        new SimplifiedAuthor('123', 'Joanne Rowling'),
        new SimplifiedAuthor('782', 'Dave Eggers'),
        new SimplifiedAuthor('900', 'Modest Mussorgsky')
      ],
      ['Deep Learning', 'Knowledge Graphs'],
      new Date(2016, 1, 10),
      'https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png'
    )
  ];

  constructor(private http: HttpClient, private authorsService: AuthorsService) {}

  get blockSize(): number {
    return this._blockSize;
  }

  getSimplifiedPapersBlock(query: string, block: number): SimplifiedPaper[] {
    for (const paper of this.simplifiedPapers) {
      for (const author of paper.authors) {
        author.name = this.authorsService.simplifyAuthorName(author.name);
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
      ['Deep Learning', 'AI'],
      new Date(2019, 1, 14),
      'https://cdn-images-1.medium.com/max/2000/1*u9L_UJbV0Qfg1PZQkHna2g.png'
    );
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
