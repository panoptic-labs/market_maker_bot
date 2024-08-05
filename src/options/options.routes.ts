/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/ban-types */
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../services/error-handler';
import {
  trade,
} from './options.controllers';
import {
  TradeRequest,
  TradeResponse,
} from './options.requests';
import {
  validateTradeRequest,
} from './options.validators';
// import { NetworkSelectionRequest } from '../services/common-interfaces';

export namespace OptionsRoutes {
  export const router = Router();

  router.post(
    '/trade',
    asyncHandler(
      async (
        req: Request<{}, {}, TradeRequest>,
        res: Response<TradeResponse | string, {}>
      ) => {
        validateTradeRequest(req.body);
        res.status(200).json(await trade(req.body));
      }
    )
  );

}

