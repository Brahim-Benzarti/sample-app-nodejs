import { H2 } from "@bigcommerce/big-design"
import ErrorMessage from "../../components/error";
import Loading from "../../components/loading";
import WebHook from "../../components/management/webhook";
import { useSession } from "../../context/session";
import { Badges } from "../../enums/bigdesign";
import { useWebhooks } from "../../lib/hooks";
import { WebHooks } from "../../types";
import { Status } from "../../types/misc";

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
    let updatedWebhooks: WebHooks= JSON.parse(JSON.stringify(webhooks));
    let updatedWebhook= updatedWebhooks.data.find(webhook => webhook.scope === scope );
    let webhook= webhooks.data.find(webhook => webhook.scope === scope )
    updatedWebhook.addon={step: 0, stats: []};

    if(webhook){
      updatedWebhook.addon.stats.push({
        message: 'Retreiving already created webhook',
        badge: Badges.SECONDARY,
        label: updatedWebhook.is_active?'Is Active':'Not Active'
      });
      if (!webhook.is_active){
        updatedWebhook.addon.stats.push({
          message: `Retreiving data updated after ${new Date(webhook.updated_at * 1000).toDateString()}`,
          badge: Badges.SECONDARY,
          label: 'Fetching'
        });
        mutateWebhooks(JSON.parse(JSON.stringify(updatedWebhooks)), false)
        let res= await fetch(`${WebHookRoutes[scope]}?updated_after=${webhook.updated_at * 1000}&context=${encodedContext}`);
        if(res.ok){
          let actualRes= await res.json();
          if(actualRes.operation_successfull){
            updatedWebhook.addon.step=1;
            updatedWebhook.addon.stats.push({
              message: `Successfully Synced all previous data`,
              badge: Badges.SUCCESS,
              label: 'Success'
            });
          }else{
            updatedWebhook.addon.stats.push({
              message: `Errors occured while updating`,
              badge: Badges.DANGER,
              label: 'Error'
            });
          }
        }else{
          updatedWebhook.addon.stats.push({
            message: `Request Error`,
            badge: Badges.DANGER,
            label: 'Error'
          });
        }
      }

      updatedWebhook.addon.stats.push({
        message: 'Updating webhook status',
        badge: Badges.SECONDARY,
        label: updatedWebhook.is_active?'To Not Active':'To Active'
      });
      mutateWebhooks(JSON.parse(JSON.stringify(updatedWebhooks)), false)
      let updateRes= await fetch(`${WebHookRoutes[scope]}?webhook_id=${webhook.id}&context=${encodedContext}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({is_active: !webhook.is_active}),
      });
      if(updateRes.ok){
        let actualRes= await updateRes.json();
        if(actualRes.operation_successfull){
          updatedWebhook.is_active= !webhook.is_active
          updatedWebhook.addon.step=2;
          updatedWebhook.addon.stats.push({
            message: `Successfully registered webhook`,
            badge: Badges.SUCCESS,
            label: 'Success'
          });
        }else{
          console.debug("Some errors occured while updating webhook")
        }
      }else{
        console.debug("Error Update", updateRes)
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
    mutateWebhooks(JSON.parse(JSON.stringify(updatedWebhooks)), false)

    // Validate data after 2seconds
    await new Promise(resolve=>setTimeout(resolve, 5000))
    mutateWebhooks()
  }

  if(isLoading ) return <Loading />
  if(error ) return <ErrorMessage error={ error } />

  return (
    <>
      <H2>WebHooks</H2>
      <WebHook 
        name='Products' 
        scope={WebHookScopes.PRODUCTS} 
        webhook={webhooks.data.find(webhook => webhook.scope === WebHookScopes.PRODUCTS )} 
        onChange={handleWebhook}
      />
      <WebHook 
        name='Customers' 
        scope={WebHookScopes.CUSTOMERS} 
        webhook={webhooks.data.find(webhook => webhook.scope === WebHookScopes.CUSTOMERS )} 
        onChange={handleWebhook}
      />
    </>
  )
}

export default Dashboard;