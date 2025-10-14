import { Component, OnInit } from '@angular/core';
import { OnboardingMainheaderComponent } from '../onboarding-mainheader/onboarding-mainheader.component';
import { HeaderComponent } from 'src/app/shared/header/header.component';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-past-offers',
  templateUrl: './past-offers.component.html',
  styleUrls: ['./past-offers.component.scss'],
  standalone: true,
  imports: [OnboardingMainheaderComponent, IonicModule, HeaderComponent]
})
export class PastOffersComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
