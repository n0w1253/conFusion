import { Component, OnInit, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { trigger, state, style, animate, transition } from '@angular/animations';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    trigger('visibility', [
        state('shown', style({
            transform: 'scale(1.0)',
            opacity: 1
        })),
        state('hidden', style({
            transform: 'scale(0.5)',
            opacity: 0
        })),
        transition('* => *', animate('0.5s ease-in-out'))
    ])
  ]
})
export class DishdetailComponent implements OnInit {

  visibility = 'shown';
  
  dish: Dish;
  dishIds: number[];
  prev: number;
  next: number;
  errMess: string;

  commentForm: FormGroup;
  newComment: Comment;

  dishcopy = null;

  formErrors = {
    'comment': '',
    'author': ''
  };

    validationMessages = {
    'comment': {
      'required':      'Comment is required.'
    },
    'author': {
      'required':      'Author is required.',
      'minlength':     'Auther must be at least 2 characters long.',
    }
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    @Inject('BaseURL') private BaseURL,
    private fb:FormBuilder) {
      this.createForm();
     }


 createForm(): void {
   /* rating: number;
    comment: string;
    author: string;
    date: string;
    */
    this.commentForm = this.fb.group({
      rating: [5, Validators.required ],
      comment: ['', Validators.required ],
      author: ['', [Validators.required,Validators.minLength(2)]]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
 }

 onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }

    }
  }

  onSubmit() {
      this.newComment = this.commentForm.value;
      console.log(this.newComment);
      this.newComment.date = (new Date()).toISOString();
      this.dishcopy.comments.push(this.newComment);
      this.dishcopy.save()
      .subscribe(dish => { this.dish = dish; console.log(this.dish); });

      this.commentForm.reset({
      rating: 5,
      comment: '',
      author: ''
    });
  }

  ngOnInit() {
    //let id= +this.route.snapshot.params['id'];
    //this.dishservice.getDish(id).subscribe(dish => this.dish = dish);

    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds,
    errmess => this.errMess = <any>errmess);
    this.route.params
      .switchMap((params: Params) => {this.visibility = 'hidden'; return this.dishservice.getDish(+params['id'])})
      .subscribe(dish => { this.dish = dish; 
        this.dishcopy = dish;
        this.setPrevNext(dish.id);
        this.visibility = 'shown';  },
        errmess => { this.dish = null; this.errMess = <any>errmess; }
      );
  }

  setPrevNext(dishId: number) {
    let index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1)%this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1)%this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }
}
