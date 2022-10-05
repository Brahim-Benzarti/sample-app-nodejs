import { Flex, FlexItem, H3, Panel, Switch } from "@bigcommerce/big-design";

interface WebHookProps {
  name: string,
  checked: boolean,
  onChange(scope: string): any,
  type: string
}

const WebHook = ({name, checked, onChange, type}: WebHookProps) =>{

  const handleChange = () =>{
    onChange(type)
  }

  return (
    <Panel id={name.toLowerCase()}>
      <Flex justifyContent={'space-between'}>
        <FlexItem>
          <H3>{name}</H3>
        </FlexItem>
        <FlexItem>
          <Switch checked={ checked || false } onChange={handleChange}></Switch>
        </FlexItem>
      </Flex>
      {/* <Stepper ></Stepper> */}
    </Panel>
  )
}

export default WebHook;