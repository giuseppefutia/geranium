import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  NavController,
  ModalController,
  LoadingController
} from '@ionic/angular';
import { Chart, ChartConfiguration } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { ResultsService } from '../../services/results.service';

// Import models
import { SimplifiedPaper } from '../../model/paper.model';
import { SimplifiedAuthor } from '../../model/simplified-author.model';
import { Topic } from '../../model/topic.model';

// Import components
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

  isLoading; // Hide/Show ionSkeletonText
  isRedirecting; // Does not display the content of the page if it is redirecting
  endOfResults = false; // Blocks the ionInfinite when no more data is available (true)
  errorText: string;

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
        barPercentage: 1,
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
        ]
      },
      onClick: (v, e) => {
        if (e[0] !== undefined) {
          this.onChartClick.call(this, e);
        }
      },
      onHover: (mouse, chartEl) => {
        mouse.target.style.cursor = chartEl[0] ? 'pointer' : 'default';
      }
    }
  };

  constructor(
    private navCtrl: NavController,
    private resultsService: ResultsService,
    private route: ActivatedRoute,
    private dataModel: ModelService,
    private loadingCtrl: LoadingController
  ) {
    this.firstTime = true;
    this.isRedirecting = false;
    this.isLoading = false;
    this.errorText = null;
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
            'papers',
            this.dataModel.searchTopicToString()
          ]);
        }
      }
    });
  }

  ionViewDidEnter() {
    // Controllo se back click da altro topic
  }

  // Fetch more data (scrolling)
  addData(event) {
    this.resultsService
      .getSimplifiedPapersBlock(this.dataModel.searchTopic, this.currentBlock)
      .subscribe(
        newPapers => {
          if (newPapers.length === 0) {
            // If there are no results disable infinite scroll
            event.target.disabled = true;
          } else {
            this.currentBlock++;

            this.updatePapersYears();
            this.papersYears =
              new Date().getFullYear() -
              Number.parseInt(this.allPapersYears[0].year, 10);

            this.filterPapers(true);
            this.updateChart();
            event.target.complete();
          }
        },
        () => {
          this.isRedirecting = true;
          this.errorText = 'An error occurred while fetching topics';
        }
      );
  }

  openTopicUrl() {
    if (!this.isLoading) {
      window.open(
        'https://'.concat(this.dataModel.searchTopic.wikiUrl),
        '_blank'
      );
    }
  }

  // Fetch data for the initial loading
  fetchData() {
    this.currentBlock = 0;
    this.resultsService
      .getSimplifiedPapersBlock(this.dataModel.searchTopic, this.currentBlock)
      .subscribe(
        newPapers => {
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

            this.filterPapers(false);

            // The timeout is needed for the component to be first drawn
            setTimeout(() => {
              this.createChart();
            }, 300);
          }
        },
        () => {
          this.isRedirecting = true;
          this.errorText = 'An error occurred while fetching topics';
        }
      );
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
    if (authors.length <= authorsLimit) {
      return authors.filter(
        author => (author.name = this.dataModel.shortenAuthorName(author.name))
      );
    } else {
      const shortAuthors = authors
        .filter(
          author =>
            (author.name = this.dataModel.shortenAuthorName(author.name))
        )
        .slice(0, authorsLimit);
      shortAuthors.push(new SimplifiedAuthor('', '...', ''));
      return shortAuthors;
    }
  }

  // On click on topic chip start a new search
  onTopicChipClick(topic: Topic) {
    this.loadingCtrl
      .create({
        message: 'Please wait'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.dataModel.searchTopic = topic; // Upcast
        this.navCtrl.navigateForward([
          '/',
          'results',
          'tabs',
          'papers',
          this.dataModel.searchTopicToString()
        ]);
        loadingEl.dismiss();
      });
  }

  // Open modal to get authors information -- XXX duplicated function in paper details
  onAuthorClick(author: SimplifiedAuthor, paper: SimplifiedPaper) {
    if (author.name === '...') {
      this.onPaperDetails(paper);
      return;
    }
    console.log("redirecting");
    this.navCtrl.navigateForward(['/', 'results', 'author', author.id]);
  }

  // Open modal when clicked on MORE in a card
  onPaperDetails(paper: SimplifiedPaper) {
    this.navCtrl.navigateForward(['/', 'results', 'paper', paper.id]);
  }

  onIRISDetails(paper: SimplifiedPaper) {
    if (!this.isLoading) {
      window.open(this.dataModel.getIRISUrl(paper), '_blank');
    }
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
        'papers',
        this.dataModel.searchTopic.label
      ]);
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
    for (const newPaper of this.dataModel
      .getRetrievedPapers()
      .slice(this.filteredPapers.length)) {
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
  // It calls filterPapers for filtering based on the newly received filtering rules
  onChartClick(e) {
    const bar = new BarData(e[0]._datasetIndex, e[0]._index);
    console.log(bar);

    let cnt = 0;
    for (const year of this.allPapersYears) {
      if (year.shown) {
        cnt++;
      }
    }
    if (cnt === this.allPapersYears.length) {
      for (let i = 0; i < this.allPapersYears.length; i++) {
        if (i !== bar.dataIndex) {
          this.allPapersYears[i].shown = false;
          this.chartData.datasets[bar.datasetIndex].backgroundColor[
            i
          ] = this.lightHiddenColor;
          this.chartData.datasets[bar.datasetIndex].borderColor[
            i
          ] = this.hiddenColor;
        }
      }
    } else {
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
    }
    this.filterPapers(false);
    // Update grid (is automatic)
    this.topicChart.update();
  }

  // The papers array in dataModel is filtered by the value of allPapersYears[i].shown
  // corresponding to each year. The result is stored in filteredPapers
  filterPapers(isAppending: boolean) {
    let toBePushed;
    const emptyExceptionHandling =
      !isAppending && this.filteredPapers.length === 0;
    if (isAppending || emptyExceptionHandling) {
      toBePushed = this.dataModel
        .getRetrievedPapers()
        .slice(this.filteredPapers.length);
      for (const paper of toBePushed) {
        if (
          this.allPapersYears.find(y => {
            const yearString = this.yearString(paper.submittedDate);
            return yearString === y.year && y.shown === true;
          }) !== undefined
        ) {
          this.filteredPapers.push(
            new SimplifiedPaper(
              paper.id,
              paper.title,
              this.processAuthorNames(paper.authors, this.maxAuthorsPerCard),
              this.processTopics(paper.topics, this.maxTopicsPerCard),
              paper.submittedDate,
              paper.imageUrl
            )
          );
        }
      }
    } else {
      // Filtering
      this.filteredPapers = this.filteredPapers.filter(paper => {
        return (
          this.allPapersYears.find(y => {
            const yearString = this.yearString(paper.submittedDate);
            return yearString === y.year && y.shown === true;
          }) !== undefined
        );
      });
      const allPapers = this.dataModel
        .getRetrievedPapers()
        .map(
          paper =>
            new SimplifiedPaper(
              paper.id,
              paper.title,
              this.processAuthorNames(paper.authors, this.maxAuthorsPerCard),
              this.processTopics(paper.topics, this.maxTopicsPerCard),
              paper.submittedDate,
              paper.imageUrl
            )
        )
        .filter(paper => {
          return (
            this.allPapersYears.find(y => {
              const yearString = this.yearString(paper.submittedDate);
              return yearString === y.year && y.shown === true;
            }) !== undefined
          );
        });

      // Merging (where the magic happens)
      this.dataModel.mergeArraysRightPriority(this.filteredPapers, allPapers);
    }
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
