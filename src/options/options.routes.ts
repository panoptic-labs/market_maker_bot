/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/ban-types */
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../services/error-handler';
import {
  mint,
  burn, 
  getCollateralToken0,
  getCollateralToken1,
  getAsset,
  deposit,
  withdraw,
  maxWithdraw,
  numberOfPositions
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

  router.post(
    '/getCollateralToken0',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await getCollateralToken0(req.body));
      }
    )
  );

  router.post(
    '/getCollateralToken1',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await getCollateralToken1(req.body));
      }
    )
  );

  router.post(
    '/getAsset',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await getAsset(req.body));
      }
    )
  );

  router.post(
    '/deposit',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await deposit(req.body));
      }
    )
  );

  router.post(
    '/withdraw',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await withdraw(req.body));
      }
    )
  );

  router.post(
    '/maxWithdraw',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await maxWithdraw(req.body));
      }
    )
  );

  router.post(
    '/numberOfPositions',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await numberOfPositions(req.body));
      }
    )
  );

}

