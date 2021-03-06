import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  relevantPlaces: Place[];
  private placesSub: Subscription;
  private filter = 'all';
  isLoading = false;

  constructor(private placesService: PlacesService, private authService: AuthService) { }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.onFilterUpdate(this.filter);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.placesSub.unsubscribe();
  }

  onFilterUpdate(event: string){
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      if (!userId){
        throw new Error('No user found');
      }
      if (event === 'all'){
        this.relevantPlaces = this.loadedPlaces;
      }
      if (event === 'bookable'){
        this.relevantPlaces = this.loadedPlaces.filter(place => place.userId !== userId);
      }
    })
  }
}
