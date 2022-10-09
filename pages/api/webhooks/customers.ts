import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, bigcommerceWebhookClient, getSession } from '../../../lib/auth';
import { handlePagination, stripHTML } from '../../../lib/utils';
import { BCCustomers } from '../../../types/bigcommerceCustomers';
import { CustomerWebHookPayloadScope, WebHookPayload } from '../../../types';
import * as recurlyClient from "recurly";

export default async function customers(req: NextApiRequest, res: NextApiResponse) {
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

                console.log("Syncing customers")
                let url= '/customers?include=addresses,storecredit,attributes,formfields,shopper_profile_id,segment_ids';
                let specifiTime= parseInt(updated_after as string);
                if(specifiTime > 0 && specifiTime < new Date().getTime()) url+=`&date_modified:min=${new Date(specifiTime).toISOString().split(".")[0]}`
                const customers: BCCustomers = await handlePagination(bigcommerce, url)
                let recurlyCustomersChecks= customers.data.map((customer)=>{return `code-${customer.id}`})
                let recurlyCustomersOperations= customers.data.map((customer)=>{
                    let updateBody: recurlyClient.AccountUpdate= {
                      email: customer.email,
                      firstName: customer.first_name,
                      lastName: customer.last_name,
                      company: customer.company,
                    }
                    if(customer.address_count>0) updateBody.address=customer.addresses.map((address): recurlyClient.Address=>{return {
                        city: address.city,
                        country: address.country,
                        phone: address.phone,
                        postalCode: address.postal_code,
                        street1: address.address1,
                        street2: address.address2,
                        region: address.state_or_province
                    }})[0]
                    let createBody: recurlyClient.AccountCreate={
                        ...updateBody, code: customer.id.toString(),
                    }
                    return {
                        handleUpdate: {accountId: `code-${customer.id}`, body: updateBody},
                        handleCreating: {body: createBody},
                    }
                })

                let recurlyCustomers= await Promise.allSettled(recurlyCustomersChecks.map((id)=>{return recurly.getAccount(id)}))
                let recurlyHandlingResults= await Promise.allSettled(recurlyCustomers.map((res, index)=>{
                    if(res.status=='fulfilled'){
                        if(res.value instanceof recurlyClient.Account) return recurly.updateAccount(recurlyCustomersOperations[index].handleUpdate.accountId, recurlyCustomersOperations[index].handleUpdate.body)
                    }else{
                        if(res.reason instanceof recurlyClient.errors.NotFoundError) return recurly.createAccount(recurlyCustomersOperations[index].handleCreating.body)
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
                    scope: "store/customer/*",
                    destination: `${process.env.APP_DOMAIN}/api/webhooks/customers`,
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
                    scope: "store/customer/*",
                    destination: `${process.env.APP_DOMAIN}/api/webhooks/customers`,
                    is_active: true,
                    events_history_enabled: true
                })
                res.status(200).json({operation_successfull: true})
                break
            }
            case 'POST': {
                //todo handle webhookpayload for all possible scopes
                const { created_at, data, hash, producer, scope, store_id } = (body as WebHookPayload)
                // TODO: check the payload hash for MIM attachs also use security checks
                const bigcommerce = await bigcommerceWebhookClient(producer.replace('stores/',''));
                const recurly = new recurlyClient.Client(process.env.BC_API_KEY, { 'region': 'eu' });
                const { data: customers }: BCCustomers = await bigcommerce.get(`/customers?include=addresses,storecredit,attributes,formfields,shopper_profile_id,segment_ids&id:in=${data.id}`)
                if(customers.length==0) break;
                const customer= customers[0]
                switch (scope) {
                    case CustomerWebHookPayloadScope.CREATED:
                        let createBody: recurlyClient.AccountCreate= {
                            code: customer.id.toString(),
                            email: customer.email,
                            firstName: customer.first_name,
                            lastName: customer.last_name,
                            company: customer.company,
                        }
                        if(customer.address_count>0) createBody.address=customer.addresses.map((address): recurlyClient.Address=>{return {
                            city: address.city,
                            country: address.country,
                            phone: address.phone,
                            postalCode: address.postal_code,
                            street1: address.address1,
                            street2: address.address2,
                            region: address.state_or_province
                        }})[0]
                        await recurly.createAccount(createBody)
                        break;
                    case CustomerWebHookPayloadScope.UPDATED:
                        let updatebody: recurlyClient.AccountUpdate= {
                            email: customer.email,
                            firstName: customer.first_name,
                            lastName: customer.last_name,
                            company: customer.company,
                        }
                        if(customer.address_count>0) updatebody.address=customer.addresses.map((address): recurlyClient.Address=>{return {
                            city: address.city,
                            country: address.country,
                            phone: address.phone,
                            postalCode: address.postal_code,
                            street1: address.address1,
                            street2: address.address2,
                            region: address.state_or_province
                        }})[0]
                        try { 
                            await recurly.updateAccount(`code-${customer.id}`,updatebody)
                            break;
                        } catch (error) {
                            if(error instanceof recurlyClient.errors.NotFoundError) break;
                            throw error;
                        }
                    case CustomerWebHookPayloadScope.DELETED:
                        await recurly.deactivateAccount(`code-${customer.id}`)
                        break;
                    case CustomerWebHookPayloadScope.ADDRESS_CREATED:
                        
                        break;
                    case CustomerWebHookPayloadScope.ADDRESS_UPDATED:
                        
                        break;
                    case CustomerWebHookPayloadScope.ADDRESS_DELETED:
                        
                        break;
                    case CustomerWebHookPayloadScope.PAYMENT_UPDATED:
                        
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
