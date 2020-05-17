import { SimplifiedAuthor } from './simplified-author.model';
import { Topic } from './topic.model';
import { Author } from './author.model';
import { Journal } from './journal.model';

export class SimplifiedPaper {
  constructor(
    public id: string,
    public title: string,
    public authors: SimplifiedAuthor[],
    public topics: Topic[],
    public submittedDate: Date,
    public imageUrl: string
  ) {}
}


export class Paper extends SimplifiedPaper {
  constructor(
    public id: string,
    public title: string,
    public abstract: string,
    public authors: SimplifiedAuthor[],
    public topics: Topic[],
    public submittedDate: Date,
    public imageUrl: string,
    public suggestedAuthors: Author[],
    public suggestedCoAuthors: Author[],
    public suggestedJournal: Journal[],
    public suggestedTopics: Topic[]
  ) {
    super(id, title, authors, topics, submittedDate, imageUrl);
  }
}
