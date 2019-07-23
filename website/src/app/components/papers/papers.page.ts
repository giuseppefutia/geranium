import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { Chart } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { ResultsService } from '../../services/results.service';

// Import models
import { SimplifiedPaper } from '../../model/simplified-paper.model';
import { SimplifiedAuthor } from '../../model/simplified-author.model';
import { Topic } from '../../model/topic.model';

// Import components
import { PaperDetailComponent } from '../paper-detail/paper-detail.component';
import { ModelService } from 'src/app/model/model.service';

class YearsData {
  constructor(
    public year: string,
    public papers: number,
    public shown: boolean
  ) {}
}

class BarData {
  constructor(public datasetIndex: number, public dataIndex: number) {}
}

@Component({
  selector: 'app-papers',
  templateUrl: './papers.page.html',
  styleUrls: ['./papers.page.scss']
})
export class PapersPage implements OnInit {
  @ViewChild('barCanvas') barCanvas: ElementRef;

  // Data used for the creation of the bar graph
  primaryColor = 'rgba(44, 101, 201, 0.5)';
  lightColor = 'rgba(44, 101, 201, 0.2)';
  hiddenColor = 'rgba(0, 0, 0, 0.5)';
  lightHiddenColor = 'rgba(0, 0, 0, 0.05)';
  topicChart: Chart;
  allPapersYears: YearsData[] = [];
  papersYears = 0;
  currentBlock = 0;

  filteredPapers: SimplifiedPaper[] = []; // Final filtered array of papers accessed by each card

  isLoading = false; // Hide/Show ionSkeletonText
  isRedirecting = false; // Does not display the content of the page if it is redirecting
  endOfResults = false; // Blocks the ionInfinite when no more data is available (true)

  private noDateString = 'No Date'; // String to show in graph when no date is available
  private maxTopicsPerCard = 4; // Number of topic chips in each card
  private maxAuthorsPerCard = 4; // Number of authors chips in each card

  private firstTime: boolean;

  chartData = {
    labels: [], // Must be configured with appropriate data
    datasets: [
      {
        label: '', // Must be configured with appropriate data
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }
    ]
  };

  chartOpts = {
    type: 'bar',
    data: {},
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback(value) {
                if (value % 1 === 0) {
                  // To show only integer numbers
                  return value;
                }
              }
            }
          }
        ],
        xAxes: [
          {
            barPercentage: 1
          }
        ]
      },
      onClick: (v, e) => {
        this.onChartClick.call(
          this,
          new BarData(e[0]._datasetIndex, e[0]._index)
        );
      }
    }
  };

  constructor(
    private navCtrl: NavController,
    private resultsService: ResultsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private dataModel: ModelService
  ) {
    this.firstTime = true;
  }

  /* It checks if the searchKey is present in URI. (see results-routing.module.ts)

     If it isn't but it is present in resultsService then it
     redirects to the correct page for it to be refresh-safe.

     If it is not available in resultsService it redirects to
     initial search page.
  */
  ngOnInit() {
    this.isLoading = true;
    this.addDummySlides(10);
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('searchKey')) {
        this.dataModel
          .searchTopicFromString(paramMap.get('searchKey'))
          .subscribe(r => {
            if (this.firstTime) {
              this.fetchData();
              this.firstTime = false;
            }
          });
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
            'papers',
            this.dataModel.searchTopicToString()
          ]);
        }
      }
    });
  }

  // Fetch more data (scrolling)
  addData(event) {
    this.resultsService
      .getSimplifiedPapersBlock(this.dataModel.searchTopic, this.currentBlock)
      .subscribe(newPapers => {
        if (newPapers.length === 0) {
          // If there are no results disable infinite scroll
          event.target.disabled = true;
        } else {
          this.currentBlock++;

          this.updatePapersYears();
          this.papersYears =
            new Date().getFullYear() -
            Number.parseInt(this.allPapersYears[0].year, 10);

          this.filterPapers();
          this.updateChart();
          event.target.complete();
        }
      });
  }

  openTopicUrl() {
    if (!this.isLoading) {
      window.open('https://'.concat(this.dataModel.searchTopic.wikiUrl), '_blank');
    }
  }

  // Fetch data for the initial loading
  fetchData() {
    this.resultsService
      .getSimplifiedPapersBlock(this.dataModel.searchTopic, this.currentBlock)
      .subscribe(newPapers => {
        this.filteredPapers = [];
        this.isLoading = false;
        if (newPapers.length === 0) {
          // If there are no results
          this.endOfResults = true;
        } else {
          this.currentBlock++;

          this.updatePapersYears();
          this.papersYears =
            new Date().getFullYear() -
            Number.parseInt(this.allPapersYears[0].year, 10);

          this.filterPapers();

          // The timeout is needed for the component to be first drawn
          setTimeout(() => {
            this.createChart();
          }, 300);
        }
      });
  }

  // Eliminates the searchKey topic from the list of topics and limits it to a specific number
  processTopics(topics: Topic[], topicsLimit: number): Topic[] {
    return topics
      .filter(
        topic =>
          topic.label.toLowerCase() !==
          this.dataModel.searchTopicToString().toLowerCase()
      )
      .slice(0, topicsLimit > topics.length ? topics.length : topicsLimit);
  }

  // Process author names
  processAuthorNames(
    authors: SimplifiedAuthor[],
    authorsLimit: number
  ): SimplifiedAuthor[] {
    return authors
      .filter(author => (author.name = this.simplifyAuthorName(author.name)))
      .slice(0, authorsLimit > authors.length ? authors.length : authorsLimit);
  }

  simplifyAuthorName(name: string): string {
    let builder = '';
    let i: number;
    const names = name.split(' ');
    for (i = 0; i < names.length - 1; i++) {
      builder += names[i].charAt(0).toUpperCase() + '. ';
    }
    let first = names[i].toLowerCase();
    first = first.charAt(0).toUpperCase() + first.slice(1);
    builder += first;
    return builder;
  }

  // On click on topic chip start a new search
  onTopicChipClick(topic: Topic) {
    this.dataModel.searchTopic = topic; // Upcast
    this.navCtrl.navigateForward([
      '/',
      'results',
      'tabs',
      'papers',
      this.dataModel.searchTopicToString()
    ]);
  }

  // Open modal to get authors information -- XXX duplicated function in paper details
  onAuthorClick(author: SimplifiedAuthor) {
    this.navCtrl.navigateForward([
      '/',
      'results',
      'tabs',
      'authors',
      'author',
      author.url
    ]);
  }

  // Open modal when clicked on MORE in a card
  onPaperDetails(paper: SimplifiedPaper) {
    this.modalCtrl
      .create({
        component: PaperDetailComponent,
        componentProps: { selectedPaperId: paper.id }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  // Called when top button is clicked -> returns to search page
  onBackClick() {
    if (this.dataModel.firstSearch) {
      this.navCtrl.navigateBack(['/', 'search']);
    } else {
      this.navCtrl.back();
    }
  }

  // Adjusts the configuration of the chart in the top view and shows it
  createChart() {
    this.chartData.datasets[0].label = '# of publications';
    this.updateChartData();
    this.chartOpts.data = this.chartData;
    this.topicChart = new Chart(this.barCanvas.nativeElement, this.chartOpts);
  }

  // Update chart with newly fetched data
  updateChart() {
    this.updateChartData();
    this.topicChart.update();
  }

  // Maps the new received data in the graph view
  updateChartData() {
    this.chartData.labels = this.allPapersYears.map(el => el.year);
    this.chartData.datasets[0].data = this.allPapersYears.map(el => el.papers);
    this.chartData.datasets[0].backgroundColor = new Array<string>(
      this.allPapersYears.length
    );
    this.chartData.datasets[0].borderColor = new Array<string>(
      this.allPapersYears.length
    );
    for (let i = 0; i < this.allPapersYears.length; i++) {
      this.chartData.datasets[0].backgroundColor[i] =
        this.allPapersYears[i].shown === true
          ? this.lightColor
          : this.lightHiddenColor;
      this.chartData.datasets[0].borderColor[i] =
        this.allPapersYears[i].shown === true
          ? this.primaryColor
          : this.hiddenColor;
    }
  }

  yearString(d: Date) {
    return isNaN(d.getFullYear())
      ? this.noDateString
      : d.getFullYear().toString();
  }

  // Updates the allPapersYears array containing information about
  // the number of papers for each year sorted by ascending year number with newly received papers
  updatePapersYears() {
    let found: boolean;
    this.allPapersYears = [];
    for (const newPaper of this.dataModel.getRetrievedPapers()) {
      const yearString = this.yearString(newPaper.submittedDate);

      found = false;
      for (const el of this.allPapersYears) {
        if (yearString === el.year) {
          el.papers++;
          found = true;
        }
      }
      if (found === false) {
        this.allPapersYears.push(new YearsData(yearString, 1, true));
      }
    }
    this.allPapersYears.sort((a, b) => a.year.localeCompare(b.year));
  }

  // Called when a bar on the chart is clicked
  // It filters the year corresponding to the clicked bar from allPapers
  // and puts result in filteredPapers
  onChartClick(bar: BarData) {
    this.allPapersYears[bar.dataIndex].shown = !this.allPapersYears[
      bar.dataIndex
    ].shown;
    this.chartData.datasets[bar.datasetIndex].backgroundColor[bar.dataIndex] =
      this.allPapersYears[bar.dataIndex].shown === true
        ? this.lightColor
        : this.lightHiddenColor;
    this.chartData.datasets[bar.datasetIndex].borderColor[bar.dataIndex] =
      this.allPapersYears[bar.dataIndex].shown === true
        ? this.primaryColor
        : this.hiddenColor;
    this.filterPapers();
    // Update grid (is automatic)
    this.topicChart.update();
  }

  // The allPapers array is filtered by the value of allPapersYears[i].shown
  // corresponding to each year. The result is stored in filteredPapers
  filterPapers() {
    this.filteredPapers = this.dataModel.getRetrievedPapers().filter(el => {
      return (
        this.allPapersYears.find(y => {
          const yearString = this.yearString(el.submittedDate);
          return yearString === y.year && y.shown === true;
        }) !== undefined
      );
    });
  }

  // Adds dummy slides while fetching data
  addDummySlides(howmany: number) {
    let i: number;
    for (i = 0; i < howmany; i++) {
      this.filteredPapers.push(
        new SimplifiedPaper(
          '',
          '',
          [new SimplifiedAuthor('', '', '')],
          [new Topic('', '', '', '')],
          new Date(''),
          ''
        )
      );
    }
  }
}
