export default class Error400 extends Error {
  code: Number;

  constructor(messageCode?) {
    let message;

    message = messageCode || 'An error occurred';

    super(message);
    this.code = 400;
  }
}
