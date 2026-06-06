import type { Request, Response } from "express";
import { transferService, walletService } from "../services/wallet.service.js";
import { sendSuccess, sendError } from "../utils/response.js";


export const getWallets = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        if (!userId)
            return sendError(res, "Unauthorized", 401)

        const result = await walletService.getWallet(userId);

        sendSuccess(
            res,
            "Wallets fetched successfully",
            result,
            200
        );
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Error fetching wallets";

        const status = (error as any)?.statusCode || 500;

        sendError(res, message, status);
    }
};

export const transfer = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        if (!userId)
            return sendError(res, "Unauthorized", 401);

        const { receiverUserId, amount } = req.body;

        const result = await transferService.transfer({
            userId,
            receiverUserId,
            amount: Number(amount)
        });

        sendSuccess(
            res,
            "Transfer successful",
            result,
            200
        );

    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Error fetching wallets";

        const status = (error as any)?.statusCode || 500;

        sendError(res, message, status);
    }

}