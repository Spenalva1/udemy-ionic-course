import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { stringify } from 'querystring';
import { BehaviorSubject } from 'rxjs';
import { first, map, switchMap, take, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Booking } from './booking.model';

interface BookingData {
  placeId: string;
  userId: string;
  placeTitle: string;
  placeImage: string;
  firstName: string;
  lastName: string;
  guestsNumber: number;
  dateFrom: string;
  dateTo: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    ) { }

  get bookings(){
    return this._bookings.asObservable();
  }


  fetchBookings() {
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('No user id found');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      switchMap(token => {
        return this.http.get<{ [key: string]: BookingData }>(
          `https://ionic-course-project-741bb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${
            fetchedUserId
          }"&auth=${token}`
        );
      }),
      map(resData => {
        const bookings = [];
        for (const key in resData){
          if (resData.hasOwnProperty(key)){
            bookings.push(new Booking(
              key,
              resData[key].placeId,
              resData[key].userId,
              resData[key].placeTitle,
              resData[key].placeImage,
              resData[key].firstName,
              resData[key].lastName,
              resData[key].guestsNumber,
              new Date(resData[key].dateFrom),
              new Date(resData[key].dateTo)));
          }
        }
        return bookings;
      }),
      tap(bookings => {
        this._bookings.next(bookings);
      })
    );
  }


  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestsNumber: number,
    dateFrom: Date,
    dateTo: Date
  ){
    let generatedId: string;
    let fetchedUserId: string;
    let newBooking: Booking;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId){
          throw new Error('No user id foend');
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        newBooking = new Booking(
          null,
          placeId,
          fetchedUserId,
          placeTitle,
          placeImage,
          firstName,
          lastName,
          guestsNumber,
          dateFrom,
          dateTo);
        return this.http.post<{name: string}>(`https://ionic-course-project-741bb.firebaseio.com/bookings.json?auth=${token}`,
          { ...newBooking });
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.bookings;
      }),
      take(1))
    .subscribe( bookings => {
      newBooking.id = generatedId;
      this._bookings.next(bookings.concat(newBooking));
    });
  }

  cancelBookings(bookingId: string){
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(`https://ionic-course-project-741bb.firebaseio.com/bookings/${bookingId}.json?auth=${token}`);
      }),
      switchMap(() => {
        return this.bookings;
      }),
      take(1)
    ).subscribe(bookings => {
      this._bookings.next( bookings.filter(booking => booking.id !== bookingId ) );
    });
  }
}
