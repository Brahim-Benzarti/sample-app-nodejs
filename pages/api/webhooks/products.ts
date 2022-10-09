import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, bigcommerceWebhookClient, getSession } from '../../../lib/auth';
import { handlePagination, stripHTML } from '../../../lib/utils';
import { BCProduct, BCProducts } from '../../../types/bigcommerceProduct';
import { ProductWebHookPayloadScope, WebHookPayload } from '../../../types';
import * as recurlyClient from "recurly";

export default async function products(req: NextApiRequest, res: NextApiResponse) {
    const {
        query: { updated_after, webhook_id },
        body,
        method,
    } = req;

    try {
        switch (method) {
            case 'GET': {
                const { accessToken, storeHash } = await getSession(req);
                const bigcommerce = bigcommerceClient(accessToken, storeHash);
                const recurly = new recurlyClient.Client(process.env.BC_API_KEY, { 'region': 'eu' });

                console.log("Syncing products")
                let url= '/catalog/products?include=variants';
                let specifiTime= parseInt(updated_after as string);
                if(specifiTime > 0 && specifiTime < new Date().getTime()) url+=`&date_modified:min=${new Date(specifiTime).toISOString().split("T")[0]}`
                const bcProducts: BCProducts = await handlePagination(bigcommerce, url)
                let recurlyProdcutsChecks= bcProducts.data.flatMap((product)=>product.variants.map((variant)=>{return `code-${variant.id}`}))
                let recurlyProdcutsOperations= bcProducts.data.flatMap((product)=>product.variants.map((variant)=>{
                    let updateBody: recurlyClient.ItemUpdate= {
                        name: product.name+variant.option_values.reduce((res,now)=>{return res+" - "+now.label},""),
                        externalSku: variant.sku,
                        // TODO: this should be done using the currencies endpoint
                        currencies: [
                            {
                                currency:"EUR",
                                unitAmount: variant.price??product.price
                            }
                        ],
                        description: stripHTML(product.description),
                    }
                    let createBody: recurlyClient.ItemCreate={
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
                // TODO: more descriptive response usefull when handling unexpected errors
                res.status(200).json({operation_successfull: recurlyHandlingResults.every((res)=> res.status=='fulfilled')});
                break;
            }
            case 'PATCH': {
                const { accessToken, storeHash } = await getSession(req);
                const bigcommerce = bigcommerceClient(accessToken, storeHash);

                console.log(`Updating webhook ${webhook_id}, setting it ${body.is_active}`)
                await bigcommerce.put(`/hooks/${webhook_id}`,{
                    scope: "store/product/*",
                    destination: `${process.env.APP_DOMAIN}/api/webhooks/products`,
                    is_active: body.is_active,
                    events_history_enabled: true
                })
                res.status(200).json({operation_successfull: true})
                break
            }
            case 'PUT': {
                const { accessToken, storeHash } = await getSession(req);
                const bigcommerce = bigcommerceClient(accessToken, storeHash);

                // TODO: use the secure way
                console.log("Creating webhook")
                await bigcommerce.post('/hooks',{
                    scope: "store/product/*",
                    destination: `${process.env.APP_DOMAIN}/api/webhooks/products`,
                    is_active: true,
                    events_history_enabled: true
                })
                res.status(200).json({operation_successfull: true})
                break
            }
            case 'POST': {
                // TODO: handle webhookpayload for all possible scopes
                const { created_at, data, hash, producer, scope, store_id } = (body as WebHookPayload)
                // TODO: check the payload hash for MIM attachs also use security checks
                const bigcommerce = await bigcommerceWebhookClient(producer.replace('stores/',''));
                const recurly = new recurlyClient.Client(process.env.BC_API_KEY, { 'region': 'eu' });
                const { data: product }: BCProduct= await bigcommerce.get(`/catalog/products/${data.id}?include=variants`)
                switch (scope) {
                    case ProductWebHookPayloadScope.CREATED:
                        let recurlyCreateOperations= product.variants.map((variant): recurlyClient.ItemCreate=>{
                            return{
                                code: variant.id.toString(),
                                name: product.name+variant.option_values.reduce((res,now)=>{return res+" - "+now.label},""),
                                externalSku: variant.sku,
                                // TODO: this should be done using the currencies endpoint
                                currencies: [
                                    {
                                        currency:"EUR",
                                        unitAmount: variant.price??product.price
                                    }
                                ],
                                description: stripHTML(product.description),
                            }
                        })
                        await Promise.allSettled(recurlyCreateOperations.map(operation=>{return recurly.createItem(operation)}))
                        break;
                    case ProductWebHookPayloadScope.UPDATED:
                        let recurlyUpdateOperations= product.variants.map((variant): recurlyClient.ItemUpdate=>{
                            return{
                                name: product.name+variant.option_values.reduce((res,now)=>{return res+" - "+now.label},""),
                                externalSku: variant.sku,
                                // TODO: this should be done using the currencies endpoint
                                currencies: [
                                    {
                                        currency:"EUR",
                                        unitAmount: variant.price??product.price
                                    }
                                ],
                                description: stripHTML(product.description),
                            }
                        })
                        await Promise.allSettled(
                            (await Promise.allSettled(recurlyUpdateOperations.map((operation, index)=>{return recurly.updateItem(`code-${product.variants[index].id}`,operation)}))).map(((response, index)=>{
                                if( response.status == 'rejected' && response.reason instanceof recurlyClient.errors.NotFoundError ) return recurly.createItem({...recurlyUpdateOperations[index], code: product.variants[index].id.toString()})
                            }
                        )))
                        break;
                    case ProductWebHookPayloadScope.DELETED:
                        await Promise.allSettled(product.variants.map(variant=>{return recurly.deactivateItem(`code-${variant.id}`)}))
                        break;
                    case ProductWebHookPayloadScope.INVENTORY_UPDATED:
                        break;
                    case ProductWebHookPayloadScope.INVENTORY_ORDER_UPDATED:
                        break;
                }

                res.status(200).end()
                break
            }
            default: {
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH']);
                res.status(405).end(`Method ${method} Not Allowed`);
            }
        }
    } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
    }
}
