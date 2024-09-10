/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/ban-types */
import { BigNumber } from 'ethers';
import { Router, Request, Response } from 'express';
import { asyncHandler } from '../services/error-handler';
import {
  addLeg,
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
  createBigLizard,
  createCallCalendarSpread,
  createCallDiagonalSpread,
  createCallRatioSpread,
  createCallSpread,
  createCallZEBRASpread,
  createIronButterfly,
  createIronCondor,
  createJadeLizard,
  createPutCalendarSpread,
  createPutDiagonalSpread,
  createPutRatioSpread,
  createPutSpread,
  createPutZEBRASpread,
  createStraddle,
  createStrangle,
  createSuperBear,
  createSuperBull,
  createZEEHBS,
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
  ExecuteMintRequest,
  MintResponse,
  ExecuteBurnRequest,
  BurnResponse,
} from './options.requests';
// import {
//   validateMintRequest,
//   validateBurnRequest,
// } from './options.validators';

export namespace OptionsRoutes {
  export const router = Router();

  router.post(
    '/addLeg',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await addLeg(req.body));
      }
    )
  )

  router.post(
    '/mint',
    asyncHandler(
      async (
        req: Request<{}, {}, ExecuteMintRequest>,
        res: Response<MintResponse | string, {}>
      ) => {
        // TODO: We need to iterate on this; they normally work but we changed up the request format.
        // validateMintRequest(req.body);
        res.status(200).json(await mint(req.body));
      }
    )
  );

  router.post(
    '/burn',
    asyncHandler(
      async (
        req: Request<{}, {}, ExecuteBurnRequest>,
        res: Response<BurnResponse | string, {}>
      ) => {
        // TODO: We need to iterate on this; they normally work but we changed up the request format.
        // validateBurnRequest(req.body);
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
    '/createBigLizard',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createBigLizard(req.body));
      }
    )
  );

  router.post(
    '/createCallCalendarSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createCallCalendarSpread(req.body));
      }
    )
  );

  router.post(
    '/createCallDiagonalSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createCallDiagonalSpread(req.body));
      }
    )
  );

  router.post(
    '/createCallRatioSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createCallRatioSpread(req.body));
      }
    )
  );

  router.post(
    '/createCallSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createCallSpread(req.body));
      }
    )
  );

  router.post(
    '/createCallZEBRASpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createCallZEBRASpread(req.body));
      }
    )
  );

  router.post(
    '/createIronButterfly',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createIronButterfly(req.body));
      }
    )
  );

  router.post(
    '/createIronCondor',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createIronCondor(req.body));
      }
    )
  );

  router.post(
    '/createJadeLizard',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createJadeLizard(req.body));
      }
    )
  );

  router.post(
    '/createPutCalendarSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createPutCalendarSpread(req.body));
      }
    )
  );

  router.post(
    '/createPutDiagonalSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createPutDiagonalSpread(req.body));
      }
    )
  );

  router.post(
    '/createPutRatioSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createPutRatioSpread(req.body));
      }
    )
  );

  router.post(
    '/createPutSpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createPutSpread(req.body));
      }
    )
  );

  router.post(
    '/createPutZEBRASpread',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createPutZEBRASpread(req.body));
      }
    )
  );

  router.post(
    '/createStraddle',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createStraddle(req.body));
      }
    )
  );

  router.post(
    '/createStrangle',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createStrangle(req.body));
      }
    )
  );

  router.post(
    '/createSuperBear',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createSuperBear(req.body));
      }
    )
  );

  router.post(
    '/createSuperBull',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createSuperBull(req.body));
      }
    )
  );

  router.post(
    '/createZEEHBS',
    asyncHandler(
      async (
        req: Request<{}, {}, any>,
        res: Response<BigNumber | unknown>
      ) => {
        res.status(200).json(await createZEEHBS(req.body));
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
