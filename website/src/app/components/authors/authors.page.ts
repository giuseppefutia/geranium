import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { Author, PapersPerTopics } from '../../model/author.model';
import { ExpandedAuthor } from '../../model/author.model';
import { AuthorDetailComponent } from '../author-detail/author-detail.component';
import { ResultsService } from '../../services/results.service';
import { ModelService } from 'src/app/model/model.service';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.page.html',
  styleUrls: ['./authors.page.scss']
})
export class AuthorsPage implements OnInit {
  currentBlock = 0;
  maxTopicsPerCard = 4;
  filteredAuthors: Author[] = [];

  isLoading = false;
  isRedirecting = false;
  endOfResults = false;
  errorText: string;

  private firstTime: boolean;

  constructor(
    private navCtrl: NavController,
    private resultsService: ResultsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private dataModel: ModelService
  ) {
    this.firstTime = true;
    this.errorText = null;
  }

  /**
   * Initialization of the component
   */
  ngOnInit() {
    this.isLoading = true;
    this.addDummySlides(10);
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('searchKey')) {
        this.dataModel
          .searchTopicFromString(paramMap.get('searchKey'))
          .subscribe(
            () => {
              this.dataModel.getAbstract().subscribe(
                () => {
                  if (this.firstTime) {
                    this.fetchData();
                    this.firstTime = false;
                  }
                },
                () => {
                  this.isRedirecting = true;
                  this.errorText =
                    'An error occurred while fetching the topic abstract';
                }
              );
            },
            () => {
              this.isRedirecting = true;
              this.errorText = 'An error occurred while fetching topics';
            }
          );
      } else {
        if (this.dataModel.searchTopicToString() === '') {
          this.navCtrl.navigateBack(['/search']);
          return;
        } else {
          this.isRedirecting = true;
          this.navCtrl.navigateForward([
            '/',
            'results',
            'tabs',
            'authors',
            this.dataModel.searchTopicToString()
          ]);
        }
      }
    });
  }

  /**
   * Get data from backend and add them to the collection
   */
  fetchData() {
    this.currentBlock = 0;
    this.resultsService
      .getAuthorsBlock(this.dataModel.searchTopic, this.currentBlock)
      .subscribe(
        newAuthors => {
          this.isLoading = false;

          if (newAuthors.length === 0) {
            this.endOfResults = true;
          } else {
            this.currentBlock++;
            this.filterAuthors();
          }
        },
        () => {
          this.errorText = 'An error occurred while fetching authors';
        }
      );
  }

  /**
   * Filter the topics of interest of each Author
   * @param topics array of the topic of interest
   * @param topicsLimit number of topic to be showed
   */
  processTopics(topics: PapersPerTopics[], topicsLimit: number): PapersPerTopics[] {
    return topics
     .sort((t1, t2) => t1.occ - t2.occ)
      .filter(
        topic =>
          topic.label.toLowerCase() !==
          this.dataModel.searchTopicToString().toLowerCase()
      )
      .slice(0, topicsLimit > topics.length ? topics.length : topicsLimit);
  }

  filterAuthors() {
    this.filteredAuthors = this.dataModel.getRetrievedAuthors().map(author => {
      return new Author(
        author.id,
        author.name,
        author.url,
        author.department,
        author.topics,
        author.imageUrl,
        author.numberOfPapers,
        this.processTopics(author.papersPerTopics, this.maxTopicsPerCard)
      );
    });
  }

  openTopicUrl() {
    if (!this.isLoading) {
      window.open(
        'https://'.concat(this.dataModel.searchTopic.wikiUrl),
        '_blank'
      );
    }
  }

  // Called by infinite scroll to load more data
  onMoreAuthors(event) {
    this.resultsService
      .getAuthorsBlock(this.dataModel.searchTopic, this.currentBlock)
      .subscribe(
        newAuthors => {
          event.target.complete();
          if (newAuthors.length === 0) {
            event.target.disabled = true; // no more results
          } else {
            this.currentBlock++;
          }
          this.filterAuthors();
        },
        () => {
          this.errorText = 'An error occurred while fetching authors';
        }
      );
  }

  // Open modal when clicked on MORE in a card
  // To get data of an author we need the author URI and the searched topic
  onAuthorDetails(author: Author) {
    this.modalCtrl
      .create({
        component: AuthorDetailComponent,
        componentProps: {
          selectedAuthorURI: author.url,
          selectedTopicLabel: this.dataModel.searchTopicToString()
        }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  // On click on topic chip start a new search
  onTopicChipClick(topic: string) {
    this.dataModel.searchTopicFromString(topic).subscribe(res => {
      this.navCtrl.navigateForward([
        '/',
        'results',
        'tabs',
        'authors',
        this.dataModel.searchTopicToString()
      ]);
    });
  }

  // Called when top button is clicked -> returns to search page
  onBackClick() {
    this.dataModel.popSearchState();
    if (this.dataModel.getSearchStackLength() === 0) {
      this.navCtrl.navigateBack(['/', 'search']);
    } else {
      this.navCtrl.navigateForward([
        '/',
        'results',
        'tabs',
        'authors',
        this.dataModel.searchTopic.label
      ]);
    }
  }

  // Adds dummy slides while fetching data
  addDummySlides(howmany: number) {
    let i: number;
    for (i = 0; i < howmany; i++) {
      this.filteredAuthors.push(new Author('', '', '', '', [], '', 0, []));
    }
  }
}
