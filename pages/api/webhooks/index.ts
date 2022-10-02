import { NextApiRequest, NextApiResponse } from "next";
import { ApiError } from "next/dist/server/api-utils";
import Error from "next/error";
import { bigcommerceClient, getSession } from "../../../lib/auth";
import { WebHooks } from "../../../types/webhook";

export default async function webHooks(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    const { accessToken, storeHash } = await getSession(req);
    const bigcommerce= bigcommerceClient(accessToken, storeHash);

    switch (method) {
      case 'GET':
        const webHooks: WebHooks = await bigcommerce.get('/hooks');
        res.status(200).json(webHooks)
        break;
      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (error) {
    const { message, response } = error;
    res.status(response?.status || 500 ).json({message});
  }
}