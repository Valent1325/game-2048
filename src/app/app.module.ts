import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FieldModule } from './field/field.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FieldComponent } from './field/field/field.component';



import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FieldModule,
    BrowserAnimationsModule,
    FieldModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
