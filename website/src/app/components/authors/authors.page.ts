import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { Author, PapersPerTopics } from '../../model/author.model';
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

  private hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }

  hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = this.hue2rgb;

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  /**
   * Filter the topics of interest of each Author
   * @param topics array of the topic of interest
   * @param topicsLimit number of topic to be showed
   */
  processTopics(
    topics: PapersPerTopics[],
    topicsLimit: number
  ): PapersPerTopics[] {
    return topics
      .sort((t1, t2) => t1.occ - t2.occ)
      .filter(topic => {
        /*
        background: rgba(var(--ion-color-base-rgb),.08);
        color: var(--ion-color-shade);

        ion-color-base-rgb = #3880ff = hsl(218, 100%, 61%)
        ion-color-shade = #3171e0 = hsl(218, 74%, 54%)
                  ^
                  |
        NOTE: Use Hue to vary color for number of papers
        TODO: method to determine max number of papers per topic is needed?
 */
        const hueForTopic = ((topic.label.length * 20) % 360) / 360;
        const rgb = this.hslToRgb(hueForTopic, 0.74, 0.54);
        topic.style = {
          color: 'hsl(' + hueForTopic * 360 + ', 100%, 61%)',
          background: 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.08)'
        };
        return (
          topic.label.toLowerCase() !==
          this.dataModel.searchTopicToString().toLowerCase()
        );
      })
      .slice(0, topicsLimit > topics.length ? topics.length : topicsLimit);
  }

  filterAuthors() {
    this.filteredAuthors = this.dataModel.getRetrievedAuthors().map(author => {
      return new Author(
        author.id,
        author.name,
        author.initials,
        author.url,
        author.department,
        author.topics,
        author.imageUrl,
        author.numberOfPapers,
        this.processTopics(author.papersPerTopics, this.maxTopicsPerCard),
        author.style
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
    this.navCtrl.navigateForward(['/', 'results', 'author', author.id]);
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
      this.filteredAuthors.push(new Author('', '', '', '', '', [], '', 0, [], {}));
    }
  }
}
