import { Component, OnInit, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment'
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
  
  dish: Dish;
  dishIds: number[];
  prev: number;
  next: number;

  commentForm: FormGroup;
  newComment: Comment;

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
      this.dish.comments.push(this.newComment);
      this.commentForm.reset({
      rating: 5,
      comment: '',
      author: ''
    });
  }

  ngOnInit() {
    //let id= +this.route.snapshot.params['id'];
    //this.dishservice.getDish(id).subscribe(dish => this.dish = dish);

    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
      .switchMap((params: Params) => this.dishservice.getDish(+params['id']))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
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
