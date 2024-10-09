export default class Error401 extends Error {
  code: Number;

  constructor(messageCode?) {
    let message;

    message = messageCode || 'An error occurred';

    super(message);
    this.code = 401;
  }
}
