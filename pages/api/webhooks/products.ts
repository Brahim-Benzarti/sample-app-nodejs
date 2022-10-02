import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';
import { handlePagination, stripHTML } from '../../../lib/utils';
import { BCProducts } from '../../../types/bigcommerceProduct';
import * as recurlyClient from "recurly";

export default async function products(req: NextApiRequest, res: NextApiResponse) {
    const {
        query: { after },
        body,
        method,
    } = req;

    try {
        const { accessToken, storeHash } = await getSession(req);
        const bigcommerce = bigcommerceClient(accessToken, storeHash);
        const recurly = new recurlyClient.Client(process.env.BC_API_KEY, { 'region': 'eu' });


        switch (method) {
            case 'GET': {
                let url= '/catalog/products?include=variants';
                if(parseInt(after as string)>0) url+=`&date_modified:min=${new Date(parseInt(after as string)).toISOString()}`
                //todo default sync
                const bcProducts: BCProducts = await handlePagination(bigcommerce, url)
                let recurlyProdcutsChecks= bcProducts.data.flatMap((product)=>product.variants.map((variant)=>{return `code-${variant.id}`}))
                let recurlyProdcutsOperations= bcProducts.data.flatMap((product)=>product.variants.map((variant)=>{
                    let updateBody= {
                        name: product.name+variant.option_values.reduce((res,now)=>{return res+" - "+now.label},""),
                        externalSku: variant.sku,
                        // todo this should be done using the currencies endpoint
                        currencies: [
                            {
                                currency:"EUR",
                                unitAmount: variant.price??product.price
                            }
                        ],
                        description: stripHTML(product.description),
                    }
                    let createBody={
                        ...updateBody, code: variant.id.toString(),
                    }
                    return {
                        handleUpdate: {itemId: `code-${variant.id}`, body: updateBody},
                        handleCreating: {body: createBody},
                    }
                }))

                let recurlyProdcuts= await Promise.allSettled(recurlyProdcutsChecks.map((id)=>{return recurly.getItem(id)}))
                let recurlyHandlingResults= await Promise.allSettled(recurlyProdcuts.map((res, index)=>{
                    if(res.status=='fulfilled'){
                        if(res.value instanceof recurlyClient.Item) return recurly.updateItem(recurlyProdcutsOperations[index].handleUpdate.itemId, recurlyProdcutsOperations[index].handleUpdate.body)
                    }else{
                        if(res.reason instanceof recurlyClient.errors.NotFoundError) return recurly.createItem(recurlyProdcutsOperations[index].handleCreating.body)
                    }
                }));
                res.status(200).json(recurlyHandlingResults);
                break;
            }
            case 'POST': {
                //todo handle webhookpayload for all possible scopes
                break
            }
            default: {
                res.setHeader('Allow', ['GET','POST']);
                res.status(405).end(`Method ${method} Not Allowed`);
            }
        }
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}
