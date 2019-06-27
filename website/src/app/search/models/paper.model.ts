import { SimplifiedAuthor } from './simplified-author.model';
import { Topic } from './topic.model';

export class Paper {
  constructor(
    public id: string,
    public title: string,
    public abstract: string,
    public authors: SimplifiedAuthor[],
    public topics: Topic[],
    public submitted_date: Date,
    public imageUrl: string
  ) {}
}
