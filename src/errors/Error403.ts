export default class Error403 extends Error {
  code: Number;

  constructor(messageCode?) {
    let message;

    message = messageCode || 'Forbidden';

    super(message);
    this.code = 403;
  }
}
