import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
      this.userParams = new UserParams(user);
    });
  }

  getUserParams() {
    return this.userParams;
  };

  setUserParams(params: UserParams) {
    this.userParams = params;
  };

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  };

  getMembers(userParams: UserParams) {
    //caching
    let response = this.memberCache.get(Object.values(userParams).join('-'));
    if(response) {
      return of(response);
    }
    //pagination
    let httpParams = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
    //age
    httpParams = httpParams.append('minAge', userParams.minAge.toString());
    httpParams = httpParams.append('maxAge', userParams.maxAge.toString());
    //gender
    httpParams = httpParams.append('gender', userParams.gender.toString());
    //orderBy
    httpParams = httpParams.append('orderBy', userParams.orderBy.toString());

    return getPaginatedResult<Member[]>(this.baseUrl + 'users', httpParams, this.http).pipe(
      map(response => {
        this.memberCache.set(Object.values(userParams).join('-'), response);
        return response;
      })
    );
  }

  getMember(username: string) {
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((m: Member) => m.username === username);
    if(member) {
      return of(member);
    }
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member); // how it's work?
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }
  
  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let httpParams = getPaginationHeaders(pageNumber, pageSize);
    httpParams = httpParams.append('predicate', predicate);
    return getPaginatedResult<Member[]>(this.baseUrl + 'likes', httpParams, this.http)
  }
}
