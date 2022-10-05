import { Flex, FlexItem, H2, H3, Panel, Stepper, Switch } from "@bigcommerce/big-design"
import { useRouter } from "next/router";
import ErrorMessage from "../../components/error";
import Loading from "../../components/loading";
import { useSession } from "../../context/session";
import { useWeebhooks } from "../../lib/hooks";

export const WebHookScopes = {
  PRODUCTS: 'store/product/*',
  CUSTOMERS: 'store/customer/*'
};

const Dashboard = () =>{
  const router = useRouter();
  const encodedContext = useSession()?.context;
  const { error, isLoading, webhooks } = useWeebhooks();

  const handleProductsWebhook = async ()=>{
    let webhook= webhooks.data.find(webhook => webhook.scope === WebHookScopes.PRODUCTS )
    if(webhook){
      if (!webhook.is_active){
        let res= await fetch(`/api/webhooks/products?updated_after=${webhook.updated_at}&context=${encodedContext}`);
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

      let updateRes= await fetch(`/api/webhooks/products?webhook_id=${webhook.id}&context=${encodedContext}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({is_active: !webhook.is_active}),
      });
      if(updateRes.ok){
        let actualRes= await updateRes.json();
        console.debug("Update", updateRes, actualRes)
        if(actualRes.operation_successfull){
          console.debug("Webhook updated")
        }else{
          console.debug("Some errors occured while updating webhook")
        }
      }else{
        console.debug("Update", updateRes)
      }

      router.push('/management');

    }else{

      let syncRes= await fetch(`/api/webhooks/products?context=${encodedContext}`);
      if(syncRes.ok){
        let actualRes= await syncRes.json();
        if(actualRes.operation_successfull) console.debug("All previous products updated")
        console.debug("Some errors occured while updating previous products")
      }else{
        console.error(syncRes.status)
      }

      let createRes= await fetch(`/api/webhooks/products?context=${encodedContext}`, {method: 'PUT'});
      if(createRes.ok){
        let actualRes= await createRes.json();
        if(actualRes.operation_successfull) console.debug("Webhook created")
        console.debug("Some errors occured while creating webhook")
      }else{
        console.error(createRes.status)
      }

    }
  }

  const handleCustomerWebhook = ()=>{
    console.debug("Request to reverse status")
  }

  if(isLoading ) return <Loading />
  if(error ) return <ErrorMessage error={ error } />

  return (
    <>
      <H2>WebHooks</H2>
      <Panel id='products'>
        <Flex justifyContent={'space-between'}>
          <FlexItem>
            <H3>Products</H3>
          </FlexItem>
          <FlexItem>
            <Switch checked={webhooks.data.find(webhook => webhook.scope === WebHookScopes.PRODUCTS )?.is_active || false } onChange={handleProductsWebhook}></Switch>
          </FlexItem>
        </Flex>
        {/* <Stepper ></Stepper> */}
      </Panel>
      <Panel id='customers'>
        <Flex justifyContent={'space-between'}>
          <FlexItem>
            <H3>Customers</H3>
          </FlexItem>
          <FlexItem>
            <Switch checked={webhooks.data.find(webhook => webhook.scope === WebHookScopes.CUSTOMERS )?.is_active || false } onChange={handleCustomerWebhook}></Switch>
          </FlexItem>
        </Flex>
        
      </Panel>
    </>
  )
}

export default Dashboard;