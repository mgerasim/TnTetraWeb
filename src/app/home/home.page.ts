import { Component } from '@angular/core';
import {Tag} from "./models/tag";
import {Content} from "./models/content";
import {delay} from "rxjs";

enum Mode {
  init,
  scanning,
  sending
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  mode: Mode = Mode.init;

  xmlTag = '';

  get isInitMode() {
    return this.mode === Mode.init;
  }

  get isScanningMode() {
    return this.mode === Mode.scanning;
  }

  get isSendingMode() {
    return this.mode === Mode.sending;
  }

  isToastOpen = false;
  errorMessage = '';
  serialNumber = '';
  isSuccess = false;
  successMessage = '';

  constructor() {}

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  setSuccess(isOpen: boolean) {
    this.isSuccess = isOpen;
  }

  async scan() {

    this.mode = Mode.scanning;

    await delay(10000);

    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      console.log("> Scan started");

      ndef.addEventListener("readingerror", () => {
        console.log("Argh! Cannot read data from the NFC tag. Try another one?");
      });

      ndef.addEventListener("reading", (e: any) => {
        console.log(`> Serial Number: ${e.serialNumber}`);
        this.serialNumber = e.serialNumber;
        console.log(`> Records: (${e.message?.records?.length})`);
        this.generateTag();
      });
    } catch (error) {
      this.errorMessage = "Argh! " + error;
      console.log(this.errorMessage);
      this.serialNumber = this.errorMessage;
      this.generateTag();
      this.isToastOpen = true;
      console.error("Argh! " + error);
    }

  }

  private generateTag() {
    const tag = new Tag(this.serialNumber, new Date());
    const tagJsonString = JSON.stringify(tag);

    const base64Tag = `${btoa(tagJsonString)}`;

    console.log(base64Tag);

    const content = new Content(base64Tag);

    console.log(content);

    const contentJsonString = JSON.stringify(content);

    const contentBase64 = btoa(contentJsonString);

    this.xmlTag = `<content>${contentBase64}</content>`;

    console.log(this.xmlTag);

    this.mode = Mode.sending;
  }

  send() {
    window.location.href = `mailto:GerasimovMN@dmn.transneft.ru?subject=tetra&body=${this.xmlTag}`;
    this.isSuccess = true;
    this.successMessage = 'Письмо на отправку создано';
    this.serialNumber = '';
    this.mode = Mode.init;
  }

}
