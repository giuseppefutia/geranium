import { Injectable } from '@angular/core';
import { Author } from '../models/author.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthorsService {
  // TODO: Change when connecting to server
  // It represents the size of the chunks retrieved from the server (pagination)
  private _blockSize = 5;
  authors = [
    new Author(
      '123',
      'Joanne Rowling',
      'Department of History',
      ['Deep Learning', 'AI', 'Education'],
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg/220px-Sir_Tim_Berners-Lee_%28cropped%29.jpg',
      4
    ),
    new Author(
      '782',
      'Dave Eggers',
      'IT Department',
      ['Machine Learning', 'Deep Learning', 'Sound Design'],
      'https://pbs.twimg.com/profile_images/988775660163252226/XpgonN0X_400x400.jpg',
      2
    ),
    new Author(
      '900',
      'Modest Mussorgsky',
      'Department of Modern Physics',
      ['Deep Learning', 'AI', 'Quantum Physics'],
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg/220px-Sir_Tim_Berners-Lee_%28cropped%29.jpg',
      10
    ),
    new Author(
      'Afr',
      'Philip Ulmaniec',
      'Department of Chemistry',
      ['Biology', 'Nanotechnology', 'Deep Learning'],
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg/220px-Sir_Tim_Berners-Lee_%28cropped%29.jpg',
      23
    ),
    new Author(
      'BRB',
      'Giuseppe D\'Avino',
      'Department of Chemistry',
      ['Deep Learning', 'AI', 'Crystal Structures'],
      'https://pbs.twimg.com/profile_images/988775660163252226/XpgonN0X_400x400.jpg',
      1
    )
  ];

  constructor(private http: HttpClient) {}

  get blockSize(): number {
    return this._blockSize;
  }

  simplifyAuthorName(name: string): string {
    let builder = '';
    let i: number;
    const names = name.split(' ');
    for (i = 0; i < names.length - 1; i++) {
      builder += names[i].charAt(0).toUpperCase() + '. ';
    }
    builder += names[i];
    return builder;
  }

  getAuthorsBlock(query: string, block: number): Author[] {
    return [...this.authors];
  }

  getAuthorFromId(authorId: string) {
    return this.authors.find(author => author.id === authorId);
  }

  fetchAuthors(query: string) {
    const regex = / /g;
    const request = `PREFIX gpp:<http://geranium-project.org/publications/>
PREFIX gpk:<http://geranium-project.org/keywords/>
PREFIX purl:<http://purl.org/dc/terms/>
PREFIX dbp:<http://dbpedia.org/resource/>
select * where {
    ?publication purl:subject dbp:${query.replace(regex, '_')}
} limit 100000`;
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
