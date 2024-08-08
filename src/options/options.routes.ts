/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/ban-types */
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../services/error-handler';
import {
  mint,
  burn, 
} from './options.controllers';
import {
  MintRequest,
  MintResponse,
  BurnRequest,
  BurnResponse,
} from './options.requests';
import {
  validateMintRequest,
  validateBurnRequest,
} from './options.validators';
// import { NetworkSelectionRequest } from '../services/common-interfaces';

export namespace OptionsRoutes {
  export const router = Router();

  router.post(
    '/mint',
    asyncHandler(
      async (
        req: Request<{}, {}, MintRequest>,
        res: Response<MintResponse | string, {}>
      ) => {
        validateMintRequest(req.body);
        res.status(200).json(await mint(req.body));
      }
    )
  );

  router.post(
    '/burn',
    asyncHandler(
      async (
        req: Request<{}, {}, BurnRequest>,
        res: Response<BurnResponse | string, {}>
      ) => {
        validateBurnRequest(req.body);
        res.status(200).json(await burn(req.body));
      }
    )
  );

}

