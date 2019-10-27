import {
  Component,
  OnInit,
  Input,
  NgZone,
  AfterContentInit,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { ExpandedAuthor } from '../../model/author.model';
import { ResultsService } from 'src/app/services/results.service';
import { ModelService } from 'src/app/model/model.service';
import { PaperDetailComponent } from '../paper-detail/paper-detail.component';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

interface HeatMapData {
  topicUrl: string;
  topic: string;
  year: string;
  papers: number;
}

@Component({
  selector: 'app-author-detail',
  templateUrl: './author-detail.component.html',
  styleUrls: ['./author-detail.component.scss']
})
export class AuthorDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  // Input defined in authors.page.ts
  @Input() selectedAuthorURI: string;
  @Input() selectedTopicLabel: string;
  selectedAuthor: ExpandedAuthor; // This is read by the HTML page
  isLoading = false;
  private chart: am4charts.XYChart;
  private topicsInHeatMap = 4;

  constructor(
    private modalCtrl: ModalController,
    private resultsService: ResultsService,
    private dataModel: ModelService,
    private navCtrl: NavController,
    private zone: NgZone
  ) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.resultsService
      .getAuthorFromURIandTopic(this.selectedAuthorURI, this.selectedTopicLabel)
      .subscribe(author => {
        this.isLoading = false;
        this.selectedAuthor = this.dataModel.getAuthorDetails();
        this.updateHeatMap();
      });
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const chart = am4core.create('topicmapdiv', am4charts.XYChart);
      chart.maskBullets = false;

      const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());

      yAxis.dataFields.category = 'topic';
      xAxis.renderer.minGridDistance = 40;
      xAxis.dataFields.category = 'year';

      xAxis.renderer.grid.template.disabled = true;
      yAxis.renderer.grid.template.disabled = true;
      xAxis.renderer.axisFills.template.disabled = true;
      yAxis.renderer.axisFills.template.disabled = true;
      yAxis.renderer.ticks.template.disabled = true;
      xAxis.renderer.ticks.template.disabled = true;

      yAxis.renderer.inversed = true;

      const series_ = chart.series.push(new am4charts.ColumnSeries());
      series_.dataFields.categoryY = 'topic';
      series_.dataFields.categoryX = 'year';
      series_.dataFields.value = 'papers';
      series_.columns.template.disabled = true;
      series_.sequencedInterpolation = true;
      // series.defaultState.transitionDuration = 3000;

      const bullet = series_.bullets.push(new am4core.Circle());
      bullet.tooltipText =
        '{topic}, {year}: {papers}';
      bullet.strokeWidth = 3;
      bullet.stroke = am4core.color('#ffffff');
      bullet.strokeOpacity = 0;

      bullet.adapter.add('tooltipY', (tooltipY, target) => {
        return -target.radius + 1;
      });

      series_.heatRules.push({
        property: 'radius',
        target: bullet,
        min: 10,
        max: 30
      });

      bullet.hiddenState.properties.scale = 0.01;
      bullet.hiddenState.properties.opacity = 1;

      const hoverState = bullet.states.create('hover');
      hoverState.properties.strokeOpacity = 1;
      chart.paddingRight = 20;

      this.chart = chart;
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  updateHeatMap() {
    if (this.chart) {
      const data: HeatMapData[] = [];
      let found: boolean;
      for (const paper of this.selectedAuthor.papers) {
        const date: string =
          paper.submittedDate === undefined
            ? 'No Date'
            : paper.submittedDate.getFullYear().toString();
        for (const topic of paper.topics) {
          found = false;
          for (const dataPoint of data) {
            if (
              dataPoint.year === date &&
              dataPoint.topicUrl === topic.url
            ) {
              dataPoint.papers++;
              found = true;
              continue;
            }
          }
          if (!found) {
            data.push({
              topic: topic.label,
              topicUrl: topic.url,
              papers: 1,
              year: date
            });
          }
        }
      }
      data.sort((a, b) => {
        return b.papers - a.papers;
      });

      this.zone.runOutsideAngular(() => {
        this.chart.data = data.splice(0, this.topicsInHeatMap);
      });
    }
  }

  onTopicChipClick(topicLabel: string) {
    this.navCtrl.navigateForward([
      '/',
      'results',
      'tabs',
      'papers',
      topicLabel
    ]);
    this.onClose();
  }

  onPaperDetails(paperId: string) {
    console.log(paperId);
    this.modalCtrl
      .create({
        component: PaperDetailComponent,
        componentProps: { selecedPaperId: paperId }
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
