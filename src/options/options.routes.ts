/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/ban-types */
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../services/error-handler';
import {
  mint,
  burn, 
  liquidate,
  getCollateralToken0,
  getCollateralToken1,
  getAsset,
  deposit,
  withdraw,
  getPoolData,
  maxWithdraw,
  numberOfPositions,
  querySubgraph,
  queryOpenPositions,
  queryGreeks,
  calculateAccumulatedFeesBatch,
  optionPositionBalance,
  pokeMedian,
  forceExercise,
  settleLongPremium,
  getAccountLiquidity,
  getAccountPremium,
  getAccountFeesBase,
  calculateDelta,
  calculateGamma, 
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
    '/forceExercise',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await forceExercise(req.body));
      }
    )
  );

  router.post(
    '/liquidate',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await liquidate(req.body));
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
    '/getPoolData',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await getPoolData(req.body));
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

  router.post(
    '/querySubgraph',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await querySubgraph(req.body));
      }
    )
  ); 

  router.post(
    '/queryOpenPositions',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await queryOpenPositions(req.body));
      }
    )
  );

  router.post(
    '/queryGreeks',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await queryGreeks(req.body));
      }
    )
  );

  router.post(
    '/calculateAccumulatedFeesBatch',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await calculateAccumulatedFeesBatch(req.body));
      }
    )
  );

  router.post(
    '/optionPositionBalance',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await optionPositionBalance(req.body));
      }
    )
  );

  router.post(
    '/pokeMedian',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await pokeMedian(req.body));
      }
    )
  );

  router.post(
    '/settleLongPremium',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await settleLongPremium(req.body));
      }
    )
  );

  router.post(
    '/getAccountLiquidity',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await getAccountLiquidity(req.body));
      }
    )
  );

  router.post(
    '/getAccountPremium',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await getAccountPremium(req.body));
      }
    )
  );

  router.post(
    '/getAccountFeesBase',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await getAccountFeesBase(req.body));
      }
    )
  );

  router.post(
    '/calculateDelta',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await calculateDelta(req.body));
      }
    )
  );

  router.post(
    '/calculateGamma',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<any | string, {}>
      ) => {
        res.status(200).json(await calculateGamma(req.body));
      }
    )
  );

}


