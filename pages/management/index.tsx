import { H2 } from "@bigcommerce/big-design"
import ErrorMessage from "../../components/error";
import Loading from "../../components/loading";
import WebHook from "../../components/management/webhook";
import { useSession } from "../../context/session";
import { Badges } from "../../enums/bigdesign";
import { useWebhooks } from "../../lib/hooks";
import { WebHooks } from "../../types";

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
    let webhooksClone: WebHooks= JSON.parse(JSON.stringify(webhooks));
    let webhook= webhooksClone.data.find(webhook => webhook.scope === scope );
    webhook.addon={step: 0, stats: []};
    if(webhook){

      webhook.addon.stats.push({message: 'Retreiving already created webhook', badge: Badges.SECONDARY, label: webhook.is_active?'Is Active':'Not Active'});
      if (!webhook.is_active){
        webhook.addon.stats.push({message: `Retreiving data updated after ${new Date( (webhook.updated_at - (24 * 60 * 60) ) * 1000 ).toDateString()}`, badge: Badges.SECONDARY, label: 'Fetching'});
        mutateWebhooks(JSON.parse(JSON.stringify(webhooksClone)), false)
        let res= await fetch(`${WebHookRoutes[scope]}?updated_after=${ (webhook.updated_at - (24 * 60 * 60) ) * 1000 }&context=${encodedContext}`);
        if(res.ok){
          let actualRes= await res.json();
          if(actualRes.operation_successfull){
            webhook.addon.step=1;
            webhook.addon.stats.push({message: `Successfully Synced all previous data`, badge: Badges.SUCCESS, label: 'Success'});
          }else{
            webhook.addon.stats.push({message: `Errors occured while updating`, badge: Badges.DANGER, label: 'Error'});
          }
        }else{
          webhook.addon.stats.push({message: `Request Error`, badge: Badges.DANGER, label: 'Error'});
        }
      }

      webhook.addon.stats.push({message: 'Updating webhook status', badge: Badges.SECONDARY, label: webhook.is_active?'To Not Active':'To Active'});
      mutateWebhooks(JSON.parse(JSON.stringify(webhooksClone)), false)
      let updateRes= await fetch(`${WebHookRoutes[scope]}?webhook_id=${webhook.id}&context=${encodedContext}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({is_active: !webhook.is_active}),
      });
      if(updateRes.ok){
        let actualRes= await updateRes.json();
        if(actualRes.operation_successfull){
          webhook.is_active= !webhook.is_active
          webhook.addon.step=2;
          webhook.addon.stats.push({message: `Successfully registered webhook`, badge: Badges.SUCCESS, label: 'Success'});
        }else{
          webhook.addon.stats.push({message: `Some errors occured while updating webhook`, badge: Badges.DANGER, label: 'Error'});
        }
      }else{
        webhook.addon.stats.push({message: `Some errors occured while connecting to third party server`, badge: Badges.DANGER, label: 'Error'});
        console.debug("Error Update", updateRes)
      }

    }else{

      webhook.addon.stats.push({message: `Retreiving data already created`, badge: Badges.SECONDARY, label: 'Fetching'});
      mutateWebhooks(JSON.parse(JSON.stringify(webhooksClone)), false)
      let syncRes= await fetch(`${WebHookRoutes[scope]}?context=${encodedContext}`);
      if(syncRes.ok){
        let actualRes= await syncRes.json();
        if(actualRes.operation_successfull){
          webhook.addon.stats.push({message: `All previous data synced`, badge: Badges.SUCCESS, label: 'Success'});
        }else{
          webhook.addon.stats.push({message: `Some errors occured while updating previous data`, badge: Badges.DANGER, label: 'Error'});
        }
      }else{
        webhook.addon.stats.push({message: `Some errors occured while fetching data`, badge: Badges.DANGER, label: 'Error'});
        console.error(syncRes.status)
      }

      webhook.addon.stats.push({message: `Creating webhook`, badge: Badges.SECONDARY, label: 'In progress'});
      mutateWebhooks(JSON.parse(JSON.stringify(webhooksClone)), false)
      let createRes= await fetch(`${WebHookRoutes[scope]}?context=${encodedContext}`, {method: 'PUT'});
      if(createRes.ok){
        let actualRes= await createRes.json();
        if(actualRes.operation_successfull){
          webhook.addon.stats.push({message: `Webhook created`, badge: Badges.SUCCESS, label: 'Success'});
        }else{
          webhook.addon.stats.push({message: `Some errors occured while creating webhook`, badge: Badges.DANGER, label: 'Error'});
        }
      }else{
        webhook.addon.stats.push({message: `Some errors occured while connecting to third party server`, badge: Badges.DANGER, label: 'Error'});
        console.error(createRes.status)
      }
    }

    // Instant refresh
    mutateWebhooks(JSON.parse(JSON.stringify(webhooksClone)), false)
    // Validate data after 10seconds
    if(webhook.is_active) await new Promise(resolve=>setTimeout(resolve, 10000))
    mutateWebhooks()


    // TODO: show the history of the rigstered webhook logging succcess and errors after the validation is done
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