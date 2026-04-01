import { type Response } from "express";

export const sendSuccess = (res: Response, message: string, data: unknown = null, status: number = 200) => {
    res.status(status).json({
        success: true,
        message,
        data
    })
}

export const sendError = (res: Response, message: string, status: number = 500, error: unknown = null) => {
    res.status(status).json({
        success: false,
        message,
        data: error instanceof Error ? error.message : error
    })
}