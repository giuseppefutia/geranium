import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ResultsService } from '../../services/results.service';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.page.html',
  styleUrls: ['./authors.page.scss'],
})
export class AuthorsPage implements OnInit {

  searchKey: string;

  constructor(
    private navCtrl: NavController,
    private resultsService: ResultsService
  ) {}

  ngOnInit() {
    if (this.resultsService.searchKey === '') {
      this.navCtrl.navigateBack(['/search']);
    } else {
      this.searchKey = this.resultsService.searchKey;
    }

    console.log(this.searchKey);
  }
}
