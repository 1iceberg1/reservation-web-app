export default class Error404 extends Error {
  code: Number;

  constructor(messageCode?) {
    let message;

    message = messageCode || 'Not Found';

    super(message);
    this.code = 404;
  }
}
