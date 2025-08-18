export class Listener {
  constructor() {
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback) {
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
}


class InquiryListFormDataStore extends Listener {
  constructor() {
    super();
    this.data = { ...INQUIRY_LIST_SEARCH_FORM_INIT_DATA };
  }

  changeData = (data) => {
    this.data = { ...this.data, ...data };
    this.subscribers.forEach(subscriber => subscriber());
  }

  getData = () => {
    return this.data;
  }
}

export const inquiryListFormDataStore = new InquiryListFormDataStore();
