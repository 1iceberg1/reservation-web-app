import MongooseRepository from '../database/repositories/mongooseRepository';
import { IServiceOptions } from './IServiceOptions';
import PaymentRepository from '../database/repositories/paymentRepository';
import ReservationRepository from '../database/repositories/reservationRepository';
import { getConfig } from '../config';

export default class PaymentService {
  options: IServiceOptions;
  stripe: any;

  constructor(options) {
    this.options = options;
    this.stripe = require('stripe')(getConfig().STRIPE_SECRET_KEY);
  }

  generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }

  getTotalPrice(reservation) {
    let totalPrice = 0;

    reservation?.consumptions?.forEach(consumption => {
      totalPrice +=
        (consumption?.consumption?.price ?? 0) * (consumption?.quantity ?? 0);
    });

    return totalPrice;
  }

  async create(data) {
    const session = await MongooseRepository.createSession(
      this.options.database
    );

    const { currentUser } = this.options;

    const reservationData = await ReservationRepository.findAndCountAll(
      {
        filter: {
          createdBy: currentUser.id || '',
          status: 'checkin',
        },
      },
      this.options
    );

    const reservations = reservationData.rows;

    try {
      const record = await PaymentRepository.create(
        {
          ...data,
          createdBy: currentUser.id,
          reservation: reservations[0]?.id || '',
          confirmationId: this.generateRandomString(60),
          amount: this.getTotalPrice(reservations[0]),
        },
        {
          ...this.options,
          session,
        }
      );

      await MongooseRepository.commitTransaction(session);

      return {
        rows: record,
        count: 1,
      };
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(error);

      throw error;
    }
  }

  async handlePaymentIntentCompleted(intent, status: boolean) {
    if (intent.metadata) {
      const confirmationId = intent.metadata.confirmationId || '';
      if (confirmationId) {
        const payment = await PaymentRepository.findByConfirmationId(
          confirmationId,
          this.options
        );
        if (payment) {
          await PaymentRepository.update(
            payment.id,
            { status: status ? 'success' : 'failed' },
            this.options
          );
          if (status) {
            await ReservationRepository.update(
              payment.reservation.id,
              { status: 'checkout' },
              this.options
            );
          }
        }
      }
    }
  }

  async callback(data) {
    const event = data;

    switch (event.type) {
      case 'charge.succeeded':
        const paymentIntentSuccess = event.data.object;
        await this.handlePaymentIntentCompleted(paymentIntentSuccess, true);
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object;
        await this.handlePaymentIntentCompleted(paymentIntentFailed, false);
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return {
      recevied: true,
    };
  }

  async update(id, data) {
    const session = await MongooseRepository.createSession(
      this.options.database
    );

    try {
      const record = await PaymentRepository.update(id, data, {
        ...this.options,
        session,
      });

      await MongooseRepository.commitTransaction(session);

      return record;
    } catch (error) {
      await MongooseRepository.abortTransaction(session);

      MongooseRepository.handleUniqueFieldError(error);

      throw error;
    }
  }

  async destroyAll(ids) {
    const session = await MongooseRepository.createSession(
      this.options.database
    );

    try {
      for (const id of ids) {
        await PaymentRepository.destroy(id, {
          ...this.options,
          session,
        });
      }

      await MongooseRepository.commitTransaction(session);
    } catch (error) {
      await MongooseRepository.abortTransaction(session);
      throw error;
    }
  }

  async findById(id) {
    return PaymentRepository.findById(id, this.options);
  }

  async findAndCountAll(args) {
    return PaymentRepository.findAndCountAll(args, this.options);
  }

  async findLatestReservation() {
    const { currentUser } = this.options;
    const reservationData = await ReservationRepository.findAndCountAll(
      {
        filter: {
          createdBy: currentUser.id || '',
          status: 'checkin',
        },
      },
      this.options
    );

    if (!reservationData.count) {
      return { status: false, message: 'No reservation is available now' };
    }

    const reservations = reservationData.rows;

    let result = await PaymentRepository.findAndCountAll(
      {
        filter: {
          reservation: reservations[0].id || '',
          createdBy: currentUser.id || '',
          status: 'success',
        },
      },
      this.options
    );

    if (result.count) {
      return {
        status: false,
        message: 'The payment is already completed successfully',
      };
    }

    result = await PaymentRepository.findAndCountAll(
      {
        filter: {
          reservation: reservations[0].id || '',
          createdBy: currentUser.id || '',
          status: 'pending',
        },
      },
      this.options
    );

    if (!result.count) {
      result = await this.create({});
    }

    let paymentResult = result.rows[0];

    if (!paymentResult.confirmationId) {
      result = await this.create({});
      paymentResult = result.rows[0];
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: paymentResult.amount * 100,
      currency: 'brl',
      metadata: {
        confirmationId: paymentResult.confirmationId,
      },
    });

    return {
      status: true,
      client_secret: paymentIntent.client_secret || '',
    };
  }
}
