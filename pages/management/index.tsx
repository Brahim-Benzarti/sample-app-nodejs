import { Flex, FlexItem, H2, H3, Panel, Stepper, Switch } from "@bigcommerce/big-design"
import ErrorMessage from "../../components/error";
import Loading from "../../components/loading";
import { useWeebhooks } from "../../lib/hooks";

export const WebHookScopes = {
  PRODUCTS: 'store/product/*',
  CUSTOMERS: 'store/customer/*'
};

const Dashboard = () =>{
  const { error, isLoading, webhooks } = useWeebhooks();

  const handleProductsWebhook = ()=>{
    let webhook= webhooks.data.find(webhook => webhook.scope === WebHookScopes.PRODUCTS )
    if(webhook){
      if (webhook.is_active) return //todo Disable webhook
      //todo Enable webhook
      //todo Sync previous products
    }
    //todo Sync previous products

    //todo CreateWebHook
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