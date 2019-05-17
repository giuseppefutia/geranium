import { SimplifiedAuthor } from './simplified-author.model';

export class Paper {
  constructor(
    public id: string,
    public title: string,
    public abstract: string,
    public authors: SimplifiedAuthor[],
    public publicationDate: Date,
    public journals: string[],
    public imageUrl: string
  ) {}
}
