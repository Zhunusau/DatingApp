import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css'],
  encapsulation: ViewEncapsulation.Emulated // by default (like shadow DOM)
})
export class MemberCardComponent implements OnInit {
  @Input() member: Member;

  constructor(private memberService: MembersService, 
    private toastrService: ToastrService, 
    public presenceService: PresenceService) { }

  ngOnInit(): void {
  }

  addLike() {
    this.memberService.addLike(this.member.username).subscribe(() => {
      this.toastrService.success('You have liked ' + this.member.knownAs);
    });
  }

}
