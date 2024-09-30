import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { encodeData, verifySignature, verifyTimestamp } from "@/common/utils/diditSdk";
import { env } from "@/common/utils/envConfig";

class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getUser: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public kycUser: RequestHandler = async (req: Request, res: Response) => {
    const signature = req.headers["x-signature"] as string;
    if (!signature) return handleServiceResponse(ServiceResponse.failure("Not found header", {}, StatusCodes.UNAUTHORIZED), res);
    const body = req.body
    const timestamp = body.created_at;
    if (!verifyTimestamp(timestamp)) {
      return handleServiceResponse(ServiceResponse.failure("Invalid timestamp", {}, StatusCodes.UNAUTHORIZED), res);
    }
    const encodedData = encodeData(body);

    if (verifySignature(encodedData, signature, env.DIDIT_WEBHOOK_SECRET)) {
      console.log(body)
    }

    return handleServiceResponse(ServiceResponse.success("Ok", {}), res);
  }
}

export const userController = new UserController();
