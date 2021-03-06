import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy{
  loadedOffers: Place[];
  private placesSub: Subscription;
  isLoading = false;

  constructor(private placesService: PlacesService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.authService.userId.pipe(
      take(1)
    ).subscribe(userId => {
      this.placesSub = this.placesService.places.subscribe(places => {
        this.loadedOffers = places.filter(place => place.userId === userId);
      });
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.placesSub.unsubscribe();
  }

  onEdit(offerId: string, ionItemSliding: IonItemSliding){
    ionItemSliding.close();
    this.router.navigateByUrl('/places/tabs/offers/edit/' + offerId);
  }
}
