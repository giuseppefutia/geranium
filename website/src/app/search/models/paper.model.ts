import { SimplifiedAuthor } from './simplified-author.model';

export class Paper {
  constructor(
    public id: string,
    public title: string,
    public abstract: string,
    public authors: SimplifiedAuthor[],
    public topics: string[],
    public publicationDate: Date,
    public imageUrl: string
  ) {}
}
