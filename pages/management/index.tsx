import { Flex, FlexItem, H2, H3, Panel, Stepper, Switch } from "@bigcommerce/big-design"
import { useRouter } from "next/router";
import ErrorMessage from "../../components/error";
import Loading from "../../components/loading";
import WebHook from "../../components/management/webhook";
import { useSession } from "../../context/session";
import { useWebhooks } from "../../lib/hooks";

export const WebHookScopes = {
  PRODUCTS: 'store/product/*',
  CUSTOMERS: 'store/customer/*'
};

export const WebHookRoutes = {
  [WebHookScopes.PRODUCTS]: '/api/webhooks/products',
  [WebHookScopes.CUSTOMERS]: '/api/webhooks/customers'
}

const Dashboard = () =>{
  const encodedContext = useSession()?.context;
  const { error, isLoading, webhooks, mutateWebhooks } = useWebhooks();

  const handleWebhook = async (scope: string)=>{
    let updatedWebhooks= JSON.parse(JSON.stringify(webhooks));
    let updatedWebhook= updatedWebhooks.data.find(webhook => webhook.scope === scope );
    let webhook= webhooks.data.find(webhook => webhook.scope === scope )

    if(webhook){
      if (!webhook.is_active){
        let res= await fetch(`${WebHookRoutes[scope]}?updated_after=${webhook.updated_at}&context=${encodedContext}`);
        if(res.ok){
          let actualRes= await res.json();
          console.debug("Sync", res, actualRes)
          if(actualRes.operation_successfull){
            console.debug("All previous products updated")
          }else{
            console.debug("Some errors occured while updating previous products")
          }
        }else{
          console.debug("Sync", res)
        }
      }

      let updateRes= await fetch(`${WebHookRoutes[scope]}?webhook_id=${webhook.id}&context=${encodedContext}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({is_active: !webhook.is_active}),
      });
      if(updateRes.ok){
        let actualRes= await updateRes.json();
        console.debug("Update", updateRes, actualRes)
        if(actualRes.operation_successfull){
          updatedWebhook.is_active= !webhook.is_active
          console.debug("Webhook updated");
        }else{
          console.debug("Some errors occured while updating webhook")
        }
      }else{
        console.debug("Update", updateRes)
      }

    }else{

      let syncRes= await fetch(`${WebHookRoutes[scope]}?context=${encodedContext}`);
      if(syncRes.ok){
        let actualRes= await syncRes.json();
        if(actualRes.operation_successfull){
          console.debug("All previous products updated")
        }else{
          console.debug("Some errors occured while updating previous products")
        }
      }else{
        console.error(syncRes.status)
      }

      let createRes= await fetch(`${WebHookRoutes[scope]}?context=${encodedContext}`, {method: 'PUT'});
      if(createRes.ok){
        let actualRes= await createRes.json();
        if(actualRes.operation_successfull){
          console.debug("Webhook created")
        }else{
          console.debug("Some errors occured while creating webhook")
        }
      }else{
        console.error(createRes.status)
      }

    }
    mutateWebhooks(updatedWebhooks, true)
  }

  const handleCustomerWebhook = ()=>{
    console.debug("Request to reverse status")
  }

  if(isLoading ) return <Loading />
  if(error ) return <ErrorMessage error={ error } />

  return (
    <>
      <H2>WebHooks</H2>
      <WebHook name='Products' type={WebHookScopes.PRODUCTS} checked={webhooks.data.find(webhook => webhook.scope === WebHookScopes.PRODUCTS )?.is_active} onChange={handleWebhook} />
      <WebHook name='Customers' type={WebHookScopes.CUSTOMERS} checked={webhooks.data.find(webhook => webhook.scope === WebHookScopes.CUSTOMERS )?.is_active} onChange={handleWebhook} />
    </>
  )
}

export default Dashboard;