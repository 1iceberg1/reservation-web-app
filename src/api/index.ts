import { authMiddleware } from '../middlewares/authMiddleware';
import { contentType } from 'mime-types';
import { createRateLimiter } from './apiRateLimiter';
import { databaseMiddleware } from '../middlewares/databaseMiddleware';
import * as fs from 'fs';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

const app = express();

// Enables CORS
app.use(cors({ origin: true }));

// Initializes and adds the database middleware.
app.use(databaseMiddleware);

// Configures the authentication middleware
// to set the currentUser to the requests
app.use(authMiddleware);

// Default rate limiter
const defaultRateLimiter = createRateLimiter({
  max: 500,
  windowMs: 15 * 60 * 1000,
  message: 'errors.429',
});
app.use(defaultRateLimiter);

// Enables Helmet, a set of tools to
// increase security.
const cspDirectives = {
  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  'script-src': ["'self'", "'unsafe-eval'"],
};

// console.log('----- Content Security Policy -----');
// console.log(cspDirectives);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        ...cspDirectives,
      },
    },
  })
);

// Parses the body of POST/PUT request
// to JSON
app.use(bodyParser.json({ limit: '10mb' }));

// Configure the Entity routes
const routes = express.Router();

require('./auth').default(routes);
require('./file').default(routes);
require('./user').default(routes);
require('./reservation').default(routes);
require('./payment').default(routes);
require('./consumption').default(routes);
require('./webhook').default(routes);

// Add the routes to the /api endpoint
app.use('/api', routes);

const mimes = {
  '.css': 'text/css',
  '.js': 'text/javascript',
};

// For compressed files
app.get(
  ['*.css', '*.jpeg', '*.jpg', '*.js', '*.png', '*.svg'],
  (req, res, next) => {
    const gzUrl = path.resolve(__dirname, `../../frontend/build/${req.url}.gz`);

    // only if file exists
    if (!fs.existsSync(gzUrl)) {
      return next();
    }

    res.set('Content-Encoding', 'gzip');
    const ext = path.extname(req.url);
    const ctnType =
      mimes[ext] || contentType(ext) || 'application/octet-stream';
    res.set('Content-Type', ctnType);
    res.sendFile(gzUrl);
  }
);

// app.post(
//   '/webhook',
//   express.json({ type: 'application/json' }),
//   (request, response) => {
//     const event = request.body;

//     // Handle the event
//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         const paymentIntent = event.data.object;
//         // Then define and call a method to handle the successful payment intent.
//         // handlePaymentIntentSucceeded(paymentIntent);
//         break;
//       case 'payment_method.attached':
//         const paymentMethod = event.data.object;
//         // Then define and call a method to handle the successful attachment of a PaymentMethod.
//         // handlePaymentMethodAttached(paymentMethod);
//         break;
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     console.log('WEBHOOK', event.data.object.metadata);

//     // Return a response to acknowledge receipt of the event
//     response.json({ received: true });
//   }
// );

export default app;
